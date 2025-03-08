from detector import DeepfakeDetector

def main():
    detector = DeepfakeDetector()
    
    # Test with URL
    test_url = "https://antispoofing.org/wp-content/uploads/deepfake_face.jpg"  # Replace with actual test image URL
    result = detector.detect_from_url(test_url)
    print(f"URL test result: {result}")

    
    test_file = "images/deepfake_face.jpg"  # Replace with path to test image
    result = detector.detect_from_file(test_file)
    print(f"File test result: {result}")

    # Test with local file
    test_file = "images/real_1010.jpg"  # Replace with path to test image
    result = detector.detect_from_file(test_file)
    print(f"File test result: {result}")

if __name__ == "__main__":
    main()