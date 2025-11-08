"""
Unit tests for Euystacio AI
"""

import unittest
import json
from euystacio_ai import EuystacioAI


class TestEuystacioAI(unittest.TestCase):
    """Test cases for EuystacioAI class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.ai = EuystacioAI(name="TestAI", version="1.0.0")
    
    def test_initialization(self):
        """Test AI initialization"""
        self.assertEqual(self.ai.name, "TestAI")
        self.assertEqual(self.ai.version, "1.0.0")
        self.assertEqual(len(self.ai.knowledge_base), 0)
        self.assertEqual(len(self.ai.interaction_history), 0)
        self.assertIsNotNone(self.ai.created_at)
    
    def test_process_input_hello(self):
        """Test processing hello input"""
        response = self.ai.process_input("Hello!")
        self.assertIn("Hello", response['response'])
        self.assertEqual(response['input'], "Hello!")
        self.assertEqual(response['ai_name'], "TestAI")
        self.assertEqual(len(self.ai.interaction_history), 1)
        # Check Softsense fields are present
        self.assertIn('softsense', response)
        self.assertIn('love_first', response)
        self.assertIn('yin_yang', response)
    
    def test_process_input_help(self):
        """Test processing help input"""
        response = self.ai.process_input("I need help")
        self.assertIn("process information", response['response'])
        # Verify Softsense processing
        self.assertIn('harmonics', response['softsense'])
    
    def test_process_input_identity(self):
        """Test identity question"""
        response = self.ai.process_input("Who are you?")
        self.assertIn("TestAI", response['response'])
        self.assertIn("AI Collective", response['response'])
        # Verify Softsense integration
        self.assertIsInstance(response['softsense']['balanced'], bool)
    
    def test_add_knowledge(self):
        """Test adding knowledge"""
        self.ai.add_knowledge("test_key", "test_value")
        self.assertEqual(len(self.ai.knowledge_base), 1)
        self.assertIn("test_key", self.ai.knowledge_base)
        
    def test_get_knowledge(self):
        """Test retrieving knowledge"""
        self.ai.add_knowledge("key1", "value1")
        value = self.ai.get_knowledge("key1")
        self.assertEqual(value, "value1")
        
    def test_get_knowledge_nonexistent(self):
        """Test retrieving non-existent knowledge"""
        value = self.ai.get_knowledge("nonexistent")
        self.assertIsNone(value)
    
    def test_get_status(self):
        """Test getting status"""
        status = self.ai.get_status()
        self.assertEqual(status['name'], "TestAI")
        self.assertEqual(status['version'], "1.0.0")
        self.assertEqual(status['status'], "active")
        self.assertEqual(status['knowledge_items'], 0)
        self.assertEqual(status['total_interactions'], 0)
    
    def test_interaction_history(self):
        """Test interaction history tracking"""
        self.ai.process_input("Test 1")
        self.ai.process_input("Test 2")
        self.ai.process_input("Test 3")
        
        self.assertEqual(len(self.ai.interaction_history), 3)
        self.assertEqual(self.ai.interaction_history[0]['input'], "Test 1")
        self.assertEqual(self.ai.interaction_history[2]['input'], "Test 3")
    
    def test_export_state(self):
        """Test exporting state"""
        self.ai.add_knowledge("test", "data")
        self.ai.process_input("Hello")
        
        state_json = self.ai.export_state()
        state = json.loads(state_json)
        
        self.assertEqual(state['name'], "TestAI")
        self.assertEqual(state['version'], "1.0.0")
        self.assertIn('knowledge_base', state)
        self.assertIn('interaction_history', state)
        self.assertEqual(len(state['knowledge_base']), 1)
        self.assertEqual(len(state['interaction_history']), 1)
    
    def test_repr(self):
        """Test string representation"""
        self.ai.process_input("Test")
        repr_str = repr(self.ai)
        self.assertIn("TestAI", repr_str)
        self.assertIn("1.0.0", repr_str)
        self.assertIn(f"interactions={len(self.ai.interaction_history)}", repr_str)


if __name__ == '__main__':
    unittest.main()
