"""
Unit tests for Softsense Framework
"""

import unittest
from softsense import (
    SoftsenseFramework,
    NanoHarmonizingLayer,
    LoveFirstTrigger,
    SeedbringerVeto,
    HarmonizationLevel,
    PriorityTrigger,
    get_softsense,
    initialize_softsense
)


class TestNanoHarmonizingLayer(unittest.TestCase):
    """Test cases for NanoHarmonizingLayer"""
    
    def setUp(self):
        self.layer = NanoHarmonizingLayer("test_layer")
    
    def test_initialization(self):
        """Test layer initialization"""
        self.assertEqual(self.layer.name, "test_layer")
        self.assertTrue(self.layer.active)
        self.assertEqual(self.layer.harmonization_score, 1.0)
    
    def test_sense_operation_success(self):
        """Test sensing successful operations"""
        initial_score = self.layer.harmonization_score
        self.layer.sense_operation("test_op", True)
        self.assertGreaterEqual(self.layer.harmonization_score, initial_score)
        
        status = self.layer.get_status()
        self.assertEqual(status['operations_count'], 1)
        self.assertEqual(status['total_operations'], 1)
    
    def test_sense_operation_failure(self):
        """Test sensing failed operations"""
        self.layer.sense_operation("fail_op", False)
        self.assertLess(self.layer.harmonization_score, 1.0)
    
    def test_multiple_operations(self):
        """Test tracking multiple operations"""
        self.layer.sense_operation("op1", True)
        self.layer.sense_operation("op2", True)
        self.layer.sense_operation("op1", True)
        
        status = self.layer.get_status()
        self.assertEqual(status['operations_count'], 2)
        self.assertEqual(status['total_operations'], 3)


class TestLoveFirstTrigger(unittest.TestCase):
    """Test cases for LoveFirstTrigger"""
    
    def setUp(self):
        self.trigger = LoveFirstTrigger()
    
    def test_initialization(self):
        """Test trigger initialization"""
        self.assertEqual(self.trigger.balance_score, 1.0)
        self.assertEqual(self.trigger.fail_safe_threshold, 0.7)
    
    def test_evaluate_safe_action(self):
        """Test evaluating safe actions"""
        result = self.trigger.evaluate_action("read data", {})
        self.assertTrue(result)
    
    def test_evaluate_harmful_action(self):
        """Test evaluating potentially harmful actions"""
        result = self.trigger.evaluate_action("delete all data", {})
        self.assertFalse(result)
    
    def test_evaluate_authorized_action(self):
        """Test evaluating authorized actions"""
        result = self.trigger.evaluate_action("delete item", {"seedbringer": True})
        self.assertTrue(result)
    
    def test_trigger_action(self):
        """Test triggering an action"""
        self.trigger.trigger(PriorityTrigger.LOVE_FIRST, "test action", {"test": "context"})
        status = self.trigger.get_balance_status()
        self.assertEqual(status['pending_triggers'], 1)
    
    def test_balance_status(self):
        """Test getting balance status"""
        status = self.trigger.get_balance_status()
        self.assertTrue(status['fail_safe_active'])
        self.assertEqual(status['balance_score'], 1.0)


class TestSeedbringerVeto(unittest.TestCase):
    """Test cases for SeedbringerVeto"""
    
    def setUp(self):
        self.veto = SeedbringerVeto()
    
    def test_initialization(self):
        """Test veto initialization"""
        self.assertTrue(self.veto.seedbringer_authority)
    
    def test_enforce_veto(self):
        """Test enforcing a veto"""
        result = self.veto.enforce_veto(
            "critical_operation",
            "seedbringer@example.com",
            "Security requirement"
        )
        self.assertTrue(result)
        
        status = self.veto.get_veto_status()
        self.assertEqual(status['total_vetoes'], 1)
        self.assertEqual(status['critical_operations'], 1)
    
    def test_check_veto_required(self):
        """Test checking if veto is required"""
        self.assertTrue(self.veto.check_veto_required("allocation_create"))
        self.assertTrue(self.veto.check_veto_required("system_modify"))
        self.assertFalse(self.veto.check_veto_required("read_data"))
    
    def test_veto_status(self):
        """Test getting veto status"""
        status = self.veto.get_veto_status()
        self.assertTrue(status['authority_active'])
        self.assertEqual(status['total_vetoes'], 0)


class TestSoftsenseFramework(unittest.TestCase):
    """Test cases for SoftsenseFramework"""
    
    def setUp(self):
        self.softsense = SoftsenseFramework()
    
    def test_initialization(self):
        """Test framework initialization"""
        self.assertTrue(self.softsense.active)
        self.assertIsNotNone(self.softsense.audit_log)
        self.assertIsNotNone(self.softsense.love_first)
        self.assertIsNotNone(self.softsense.seedbringer_veto)
    
    def test_register_harmonizing_layer(self):
        """Test registering a harmonizing layer"""
        layer = self.softsense.register_harmonizing_layer("test_layer")
        self.assertIsNotNone(layer)
        self.assertEqual(layer.name, "test_layer")
        
        status = self.softsense.get_harmonization_status()
        self.assertIn("test_layer", status['layers'])
    
    def test_sense_algorithm_loop(self):
        """Test sensing algorithm loops"""
        self.softsense.sense_algorithm_loop("core", "operation1", True)
        self.softsense.sense_algorithm_loop("core", "operation2", True)
        
        status = self.softsense.get_harmonization_status()
        self.assertIn("core", status['layers'])
        self.assertEqual(status['layers']['core']['total_operations'], 2)
    
    def test_trigger_love_first(self):
        """Test Love First trigger"""
        approved = self.softsense.trigger_love_first("safe_action", {})
        self.assertTrue(approved)
        
        blocked = self.softsense.trigger_love_first("delete all", {})
        self.assertFalse(blocked)
    
    def test_enforce_seedbringer_veto(self):
        """Test Seedbringer veto enforcement"""
        result = self.softsense.enforce_seedbringer_veto(
            "critical_op",
            "test@example.com",
            "Testing veto"
        )
        self.assertTrue(result)
    
    def test_harmonization_status(self):
        """Test getting harmonization status"""
        self.softsense.register_harmonizing_layer("layer1")
        self.softsense.register_harmonizing_layer("layer2")
        self.softsense.sense_algorithm_loop("layer1", "op1", True)
        
        status = self.softsense.get_harmonization_status()
        self.assertTrue(status['active'])
        self.assertIn('layers', status)
        self.assertIn('average_harmonization', status)
        self.assertIn('love_first_status', status)
        self.assertIn('veto_status', status)
    
    def test_export_full_state(self):
        """Test exporting full state"""
        self.softsense.register_harmonizing_layer("test")
        self.softsense.sense_algorithm_loop("test", "op1", True)
        
        state_json = self.softsense.export_full_state()
        self.assertIsNotNone(state_json)
        self.assertIn("softsense_framework", state_json)


class TestGlobalInstance(unittest.TestCase):
    """Test cases for global Softsense instance"""
    
    def test_get_softsense(self):
        """Test getting global instance"""
        instance1 = get_softsense()
        instance2 = get_softsense()
        self.assertIs(instance1, instance2)
    
    def test_initialize_softsense(self):
        """Test initializing Softsense"""
        softsense = initialize_softsense()
        self.assertIsNotNone(softsense)
        
        status = softsense.get_harmonization_status()
        # Should have default layers registered
        self.assertIn('core_intelligence', status['layers'])
        self.assertIn('knowledge_processing', status['layers'])
        self.assertIn('interaction_handler', status['layers'])


if __name__ == '__main__':
    unittest.main()
