import cv2
import numpy as np
from PIL import Image
import io
import base64


class FaceRecognitionService:
    def __init__(self):
        # Load Haar Cascade for face detection
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.face_size = (100, 100)  # Standard size for all faces

    def detect_face(self, image_array):
        """
        Detect face in image and return the face region

        Args:
            image_array: numpy array of the image

        Returns:
            tuple: (success, face_array or error_message)
        """
        try:
            # Convert to grayscale for detection
            gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)

            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )

            if len(faces) == 0:
                return False, "No face detected in the image"

            if len(faces) > 1:
                return False, "Multiple faces detected. Please ensure only one face is visible"

            # Get the face region
            (x, y, w, h) = faces[0]
            face_region = image_array[y:y+h, x:x+w]

            return True, face_region

        except Exception as e:
            return False, f"Error detecting face: {str(e)}"

    def extract_face_encoding(self, image_array):
        """
        Extract face encoding from image

        Args:
            image_array: numpy array of the image

        Returns:
            tuple: (success, encoding_array or error_message)
        """
        # Detect face first
        success, result = self.detect_face(image_array)

        if not success:
            return False, result

        face_region = result

        try:
            # Resize face to standard size
            face_resized = cv2.resize(face_region, self.face_size)

            # Convert to grayscale
            face_gray = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)

            # Normalize pixel values
            face_normalized = face_gray / 255.0

            # Flatten to 1D array (this is our "encoding")
            encoding = face_normalized.flatten()

            return True, encoding

        except Exception as e:
            return False, f"Error extracting encoding: {str(e)}"

    def process_base64_image(self, base64_string):
        """
        Convert base64 string to numpy array

        Args:
            base64_string: base64 encoded image string

        Returns:
            tuple: (success, image_array or error_message)
        """
        try:
            # Remove data URL prefix if present
            if 'base64,' in base64_string:
                base64_string = base64_string.split('base64,')[1]

            # Decode base64
            image_bytes = base64.b64decode(base64_string)

            # Convert to PIL Image
            image = Image.open(io.BytesIO(image_bytes))

            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')

            # Convert to numpy array
            image_array = np.array(image)

            # Convert RGB to BGR (OpenCV format)
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)

            return True, image_array

        except Exception as e:
            return False, f"Error processing image: {str(e)}"

    def process_uploaded_file(self, file_bytes):
        """
        Process uploaded file bytes to numpy array

        Args:
            file_bytes: bytes of uploaded file

        Returns:
            tuple: (success, image_array or error_message)
        """
        try:
            # Convert to PIL Image
            image = Image.open(io.BytesIO(file_bytes))

            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')

            # Convert to numpy array
            image_array = np.array(image)

            # Convert RGB to BGR (OpenCV format)
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)

            return True, image_array

        except Exception as e:
            return False, f"Error processing file: {str(e)}"

    def encoding_to_string(self, encoding):
        """Convert numpy encoding array to comma-separated string for database storage"""
        return ','.join(map(str, encoding))

    def string_to_encoding(self, encoding_string):
        """Convert comma-separated string back to numpy array"""
        return np.array([float(x) for x in encoding_string.split(',')])

    def visualize_face_detection(self, image_array):
        """
        Draw rectangle around detected face (useful for debugging)

        Args:
            image_array: numpy array of the image

        Returns:
            numpy array with rectangle drawn
        """
        gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, 1.1, 5, minSize=(30, 30))

        image_copy = image_array.copy()
        for (x, y, w, h) in faces:
            cv2.rectangle(image_copy, (x, y), (x+w, y+h), (0, 255, 0), 2)

        return image_copy


# Create a global instance
face_service = FaceRecognitionService()


# Test function
if __name__ == "__main__":
    print("🧪 Testing Face Recognition Service...")

    # Test with a sample image (you would need to provide one)
    # For now, just verify the service initializes
    print(
        f"✅ Face cascade loaded: {face_service.face_cascade.empty() == False}")
    print(f"✅ Face size set to: {face_service.face_size}")
    print("✅ Face Recognition Service ready!")
