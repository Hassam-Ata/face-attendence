from sklearn.ensemble import RandomForestClassifier
import numpy as np
import pickle
import os
from datetime import datetime


class MLService:
    def __init__(self, model_path='./ml_models/face_recognition_model.pkl'):
        self.model_path = model_path
        self.model = None
        self.student_labels = {}  # Map: roll_number -> student_id

        # Create ml_models directory if it doesn't exist
        os.makedirs(os.path.dirname(model_path), exist_ok=True)

        # Try to load existing model
        self.load_model()

    def train_model(self, encodings, labels, student_mapping):
        """
        Train Random Forest model with face encodings

        Args:
            encodings: List of face encoding arrays
            labels: List of corresponding student IDs
            student_mapping: Dict mapping roll_number to student info

        Returns:
            tuple: (success, message)
        """
        try:
            if len(encodings) == 0:
                return False, "No training data provided"

            if len(encodings) != len(labels):
                return False, "Encodings and labels must have same length"

            # Convert to numpy arrays
            X = np.array(encodings)
            y = np.array(labels)

            # Train Random Forest Classifier
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=15,
                random_state=42,
                n_jobs=-1
            )

            self.model.fit(X, y)
            self.student_labels = student_mapping

            # Save the model
            self.save_model()

            return True, f"Model trained successfully with {len(encodings)} samples"

        except Exception as e:
            return False, f"Error training model: {str(e)}"

    def predict_student(self, encoding):
        """
        Predict student from face encoding

        Args:
            encoding: Face encoding array

        Returns:
            tuple: (success, result_dict or error_message)
                   result_dict contains: student_id, confidence
        """
        try:
            if self.model is None:
                return False, "Model not trained yet"

            # Reshape encoding for prediction
            encoding_reshaped = np.array(encoding).reshape(1, -1)

            # Get prediction
            prediction = self.model.predict(encoding_reshaped)[0]

            # Get prediction probabilities for confidence score
            probabilities = self.model.predict_proba(encoding_reshaped)[0]
            confidence = int(max(probabilities) * 100)

            result = {
                'student_id': int(prediction),
                'confidence': confidence
            }

            return True, result

        except Exception as e:
            return False, f"Error predicting: {str(e)}"

    def retrain_with_new_student(self, db):
        """
        Retrain model with all students from database

        Args:
            db: Database session

        Returns:
            tuple: (success, message)
        """
        try:
            from database import Student

            # Get all students with face encodings
            students = db.query(Student).filter(
                Student.face_encoding.isnot(None)).all()

            if len(students) == 0:
                return False, "No students with face encodings found"

            encodings = []
            labels = []
            student_mapping = {}

            for student in students:
                # Convert string encoding back to array
                encoding_str = student.face_encoding
                encoding = np.array([float(x)
                                    for x in encoding_str.split(',')])

                encodings.append(encoding)
                labels.append(student.id)
                student_mapping[student.roll_number] = {
                    'id': student.id,
                    'name': student.name,
                    'roll_number': student.roll_number
                }

            # Train the model
            return self.train_model(encodings, labels, student_mapping)

        except Exception as e:
            return False, f"Error retraining model: {str(e)}"

    def save_model(self):
        """Save model to disk"""
        try:
            model_data = {
                'model': self.model,
                'student_labels': self.student_labels,
                'timestamp': datetime.now().isoformat()
            }

            with open(self.model_path, 'wb') as f:
                pickle.dump(model_data, f)

            print(f"✅ Model saved to {self.model_path}")
            return True

        except Exception as e:
            print(f"❌ Error saving model: {e}")
            return False

    def load_model(self):
        """Load model from disk"""
        try:
            if not os.path.exists(self.model_path):
                print(
                    "ℹ️ No existing model found. Will create new one on first training.")
                return False

            with open(self.model_path, 'rb') as f:
                model_data = pickle.load(f)

            self.model = model_data['model']
            self.student_labels = model_data['student_labels']

            print(f"✅ Model loaded from {self.model_path}")
            print(f"   Trained with {len(self.student_labels)} students")
            return True

        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False

    def get_model_info(self):
        """Get information about the current model"""
        if self.model is None:
            return {
                'trained': False,
                'num_students': 0,
                'message': 'Model not trained yet'
            }

        return {
            'trained': True,
            'num_students': len(self.student_labels),
            'students': list(self.student_labels.keys()),
            'model_path': self.model_path
        }


# Create a global instance
ml_service = MLService()


# Test function
if __name__ == "__main__":
    print("🧪 Testing ML Service...")

    # Test with dummy data
    dummy_encodings = [
        np.random.rand(10000),  # 100x100 flattened
        np.random.rand(10000),
        np.random.rand(10000)
    ]
    dummy_labels = [1, 2, 3]
    dummy_mapping = {
        'CS001': {'id': 1, 'name': 'Student 1'},
        'CS002': {'id': 2, 'name': 'Student 2'},
        'CS003': {'id': 3, 'name': 'Student 3'}
    }

    success, message = ml_service.train_model(
        dummy_encodings, dummy_labels, dummy_mapping)
    print(f"Training: {message}")

    if success:
        # Test prediction
        test_encoding = dummy_encodings[0]
        success, result = ml_service.predict_student(test_encoding)
        if success:
            print(
                f"✅ Prediction: Student ID {result['student_id']} with {result['confidence']}% confidence")
        else:
            print(f"❌ Prediction failed: {result}")

    print("\n📊 Model Info:")
    info = ml_service.get_model_info()
    for key, value in info.items():
        print(f"   {key}: {value}")
