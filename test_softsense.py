"""
Unit tests for Softsense algorithms
"""

import unittest
from softsense import SoftsenseCore, LoveFirstAlgorithm, YinYangBalance


class TestSoftsenseCore(unittest.TestCase):
    """Test cases for SoftsenseCore class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.softsense = SoftsenseCore()
    
    def test_initialization(self):
        """Test Softsense initialization"""
        metrics = self.softsense.get_metrics()
        self.assertEqual(metrics['dignity'], 1.0)
        self.assertEqual(metrics['prosperity'], 1.0)
        self.assertEqual(metrics['respect'], 1.0)
        self.assertEqual(metrics['balance'], 1.0)
    
    def test_sense_positive_input(self):
        """Test sensing positive input"""
        result = self.softsense.sense("We care about love and prosperity for all")
        self.assertIn('harmonics', result)
        self.assertTrue(result['balanced'])
        self.assertGreater(result['harmonics']['dignity'], 0.9)
        self.assertGreater(result['harmonics']['respect'], 0.9)
    
    def test_sense_negative_input(self):
        """Test sensing negative input"""
        result = self.softsense.sense("We will harm and discriminate against others")
        self.assertIn('harmonics', result)
        self.assertFalse(result['balanced'])
        self.assertGreater(len(result['warnings']), 0)
        self.assertGreater(len(result['recommendations']), 0)
    
    def test_reset(self):
        """Test reset functionality"""
        self.softsense.sense("harmful content")
        self.softsense.reset()
        metrics = self.softsense.get_metrics()
        self.assertEqual(metrics['dignity'], 1.0)
        self.assertEqual(metrics['balance'], 1.0)


class TestLoveFirstAlgorithm(unittest.TestCase):
    """Test cases for LoveFirstAlgorithm class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.love_first = LoveFirstAlgorithm()
    
    def test_evaluate_high_love(self):
        """Test evaluation with high love indicators"""
        result = self.love_first.evaluate("We care with compassion, respect, and flourish together")
        self.assertTrue(result['prioritized'])
        self.assertGreater(result['score'], 0.7)
        self.assertGreater(len(result['triggers']), 0)
    
    def test_evaluate_low_love(self):
        """Test evaluation with low love indicators"""
        result = self.love_first.evaluate("We harm and disrespect others")
        self.assertFalse(result['prioritized'])
        self.assertLess(result['score'], 0.6)
        self.assertGreater(len(result['adjustments']), 0)
    
    def test_evaluate_neutral(self):
        """Test evaluation with neutral input"""
        result = self.love_first.evaluate("Processing data")
        self.assertIn('score', result)
        self.assertIsInstance(result['prioritized'], bool)


class TestYinYangBalance(unittest.TestCase):
    """Test cases for YinYangBalance class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.yin_yang = YinYangBalance()
    
    def test_initialization(self):
        """Test Yin-Yang initialization"""
        state = self.yin_yang.get_state()
        self.assertEqual(state['yin'], 0.5)
        self.assertEqual(state['yang'], 0.5)
        self.assertEqual(state['balance'], 1.0)
    
    def test_synchronize_yin_heavy(self):
        """Test synchronization with Yin-heavy input"""
        result = self.yin_yang.synchronize("We listen, nurture, and receive with calm peace")
        self.assertIn('balancedState', result)
        # Should have higher yin than yang
        self.assertGreaterEqual(result['balancedState']['yin'], result['balancedState']['yang'])
    
    def test_synchronize_yang_heavy(self):
        """Test synchronization with Yang-heavy input"""
        result = self.yin_yang.synchronize("We act, lead, and create with decisive execution")
        self.assertIn('balancedState', result)
        # Should have higher yang than yin
        self.assertGreaterEqual(result['balancedState']['yang'], result['balancedState']['yin'])
    
    def test_failsafe_activation(self):
        """Test fail-safe activation on severe imbalance"""
        # Create extreme imbalance
        yin_yang = YinYangBalance(balance_threshold=0.9, failsafe_enabled=True)
        result = yin_yang.synchronize("We force and demand with domination")
        # Failsafe should activate if balance is too low
        if not result['resolved']:
            self.assertTrue(result['failsafeActivated'])
    
    def test_reset(self):
        """Test reset functionality"""
        self.yin_yang.synchronize("We act and execute")
        self.yin_yang.reset()
        state = self.yin_yang.get_state()
        self.assertEqual(state['yin'], 0.5)
        self.assertEqual(state['yang'], 0.5)
        self.assertEqual(state['balance'], 1.0)


if __name__ == '__main__':
    unittest.main()
