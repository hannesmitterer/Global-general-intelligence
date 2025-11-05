#!/usr/bin/env python3
"""
Test suite for the Flask app and its modules
"""
import unittest
import json
import os
import sys
import tempfile
import shutil

# Import the modules we're testing
from red_code import ensure_red_code, load_red_code, save_red_code, RED_CODE
from reflector import reflect_and_suggest
from tutor_nomination import TutorNomination
from sentimento_pulse_interface import SentimentoPulseInterface


class TestRedCode(unittest.TestCase):
    """Test the red_code module"""
    
    def setUp(self):
        """Create a temporary directory for test files"""
        self.test_dir = tempfile.mkdtemp()
        self.test_path = os.path.join(self.test_dir, "test_red_code.json")
    
    def tearDown(self):
        """Clean up temporary directory"""
        shutil.rmtree(self.test_dir)
    
    def test_ensure_red_code_creates_file(self):
        """Test that ensure_red_code creates a new file"""
        result = ensure_red_code(self.test_path)
        self.assertTrue(result)
        self.assertTrue(os.path.exists(self.test_path))
    
    def test_load_red_code(self):
        """Test loading red_code from file"""
        ensure_red_code(self.test_path)
        data = load_red_code(self.test_path)
        self.assertIsInstance(data, dict)
        self.assertIn("symbiosis_level", data)
        self.assertIn("growth_history", data)
    
    def test_save_red_code(self):
        """Test saving red_code to file"""
        test_data = {"test": "data", "value": 123}
        save_red_code(test_data, self.test_path)
        loaded = load_red_code(self.test_path)
        self.assertEqual(loaded, test_data)


class TestReflector(unittest.TestCase):
    """Test the reflector module"""
    
    def setUp(self):
        """Set up test environment"""
        self.test_dir = tempfile.mkdtemp()
        self.original_dir = os.getcwd()
        os.chdir(self.test_dir)
        ensure_red_code()
    
    def tearDown(self):
        """Clean up"""
        os.chdir(self.original_dir)
        shutil.rmtree(self.test_dir)
    
    def test_reflect_and_suggest(self):
        """Test reflection generates proper output"""
        result = reflect_and_suggest()
        self.assertIsInstance(result, dict)
        self.assertIn("reflection", result)
        self.assertIn("suggestion", result)
        self.assertIn("timestamp", result["reflection"])
        self.assertIn("suggestion", result["suggestion"])


class TestTutorNomination(unittest.TestCase):
    """Test the tutor_nomination module"""
    
    def setUp(self):
        """Set up test environment"""
        self.test_dir = tempfile.mkdtemp()
        self.test_path = os.path.join(self.test_dir, "test_tutors.json")
        self.tutors = TutorNomination(self.test_path)
    
    def tearDown(self):
        """Clean up"""
        shutil.rmtree(self.test_dir)
    
    def test_list_tutors(self):
        """Test listing tutors"""
        tutors = self.tutors.list_tutors()
        self.assertIsInstance(tutors, list)
        self.assertGreater(len(tutors), 0)
    
    def test_nominate(self):
        """Test tutor nomination"""
        best_tutor = self.tutors.nominate()
        self.assertIsInstance(best_tutor, dict)
        self.assertIn("resonance", best_tutor)


class TestSentimentoPulseInterface(unittest.TestCase):
    """Test the SentimentoPulseInterface"""
    
    def setUp(self):
        """Set up test environment"""
        self.test_dir = tempfile.mkdtemp()
        self.spi = SentimentoPulseInterface(self.test_dir)
    
    def tearDown(self):
        """Clean up"""
        shutil.rmtree(self.test_dir)
    
    def test_receive_pulse(self):
        """Test receiving a pulse"""
        event = self.spi.receive_pulse("joy", 0.8, "high", "test note")
        self.assertIsInstance(event, dict)
        self.assertEqual(event["emotion"], "joy")
        self.assertEqual(event["intensity"], 0.8)
        self.assertEqual(event["clarity"], "high")
        self.assertEqual(event["note"], "test note")


class TestFlaskApp(unittest.TestCase):
    """Test Flask application endpoints"""
    
    def setUp(self):
        """Set up Flask test client"""
        # We need to import app here to avoid creating files in the main directory
        self.test_dir = tempfile.mkdtemp()
        self.original_dir = os.getcwd()
        os.chdir(self.test_dir)
        
        # Import and configure app
        import app as flask_app
        flask_app.app.config['TESTING'] = True
        self.client = flask_app.app.test_client()
    
    def tearDown(self):
        """Clean up"""
        os.chdir(self.original_dir)
        shutil.rmtree(self.test_dir)
    
    def test_index_route(self):
        """Test the index route"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
    
    def test_red_code_api(self):
        """Test the RED_CODE API endpoint"""
        response = self.client.get('/api/red_code')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('symbiosis_level', data)
    
    def test_tutors_api(self):
        """Test the tutors API endpoint"""
        response = self.client.get('/api/tutors')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
    
    def test_pulse_api(self):
        """Test the pulse API endpoint"""
        pulse_data = {
            "emotion": "curiosity",
            "intensity": 0.7,
            "clarity": "medium",
            "note": "test"
        }
        response = self.client.post('/api/pulse', 
                                   data=json.dumps(pulse_data),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['emotion'], 'curiosity')
        self.assertEqual(data['intensity'], 0.7)
    
    def test_reflect_api(self):
        """Test the reflection API endpoint"""
        response = self.client.get('/api/reflect')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('reflection', data)
        self.assertIn('suggestion', data)


if __name__ == '__main__':
    unittest.main()
