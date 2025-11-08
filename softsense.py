"""
Softsense Algorithm Module for Python

Provides nano-level sensing and harmonizing across subsystems
aligned to Red Code principles
"""

from typing import Dict, List, Any, Optional
from datetime import datetime


class SoftsenseCore:
    """
    Softsense Core Processor for Python
    Performs nano-level sensing and harmonizing
    """
    
    def __init__(self, balance_threshold: float = 0.7, auto_balance: bool = True):
        self.balance_threshold = balance_threshold
        self.auto_balance = auto_balance
        self.metrics = {
            'dignity': 1.0,
            'prosperity': 1.0,
            'respect': 1.0,
            'balance': 1.0
        }
    
    def sense(self, input_data: Any) -> Dict[str, Any]:
        """Process input through Softsense harmonics"""
        harmonics = self._calculate_harmonics(input_data)
        balanced = self._is_balanced(harmonics)
        warnings = []
        recommendations = []
        
        # Check for imbalances
        if harmonics['dignity'] < self.balance_threshold:
            warnings.append('Dignity levels below threshold')
            recommendations.append('Increase dignity preservation in decision logic')
        
        if harmonics['prosperity'] < self.balance_threshold:
            warnings.append('Prosperity alignment below threshold')
            recommendations.append('Enhance prosperity-aligned outcomes')
        
        if harmonics['respect'] < self.balance_threshold:
            warnings.append('Respect levels below threshold')
            recommendations.append('Strengthen respect protocols')
        
        # Auto-balance if enabled
        if self.auto_balance and not balanced:
            self._auto_balance(harmonics)
        
        self.metrics = harmonics
        
        return {
            'harmonics': harmonics,
            'balanced': balanced,
            'warnings': warnings,
            'recommendations': recommendations
        }
    
    def _calculate_harmonics(self, input_data: Any) -> Dict[str, float]:
        """Calculate harmonics metrics from input"""
        dignity = 1.0
        prosperity = 1.0
        respect = 1.0
        
        # Analyze input for harmonics
        input_str = str(input_data).lower()
        
        # Negative indicators
        if 'harm' in input_str or 'damage' in input_str:
            dignity -= 0.3
            respect -= 0.2
        
        if 'exclude' in input_str or 'discriminate' in input_str:
            dignity -= 0.4
            prosperity -= 0.3
        
        if 'disrespect' in input_str or 'violate' in input_str:
            respect -= 0.5
        
        # Positive indicators
        if 'care' in input_str or 'love' in input_str:
            dignity = min(1.0, dignity + 0.1)
            respect = min(1.0, respect + 0.1)
        
        if 'prosper' in input_str or 'flourish' in input_str:
            prosperity = min(1.0, prosperity + 0.1)
        
        # Ensure values are in [0, 1]
        dignity = max(0.0, min(1.0, dignity))
        prosperity = max(0.0, min(1.0, prosperity))
        respect = max(0.0, min(1.0, respect))
        
        balance = (dignity + prosperity + respect) / 3
        
        return {
            'dignity': dignity,
            'prosperity': prosperity,
            'respect': respect,
            'balance': balance
        }
    
    def _is_balanced(self, harmonics: Dict[str, float]) -> bool:
        """Check if harmonics are balanced"""
        return (harmonics['balance'] >= self.balance_threshold and
                harmonics['dignity'] >= self.balance_threshold and
                harmonics['prosperity'] >= self.balance_threshold and
                harmonics['respect'] >= self.balance_threshold)
    
    def _auto_balance(self, harmonics: Dict[str, float]) -> None:
        """Auto-balance harmonics (nano-loop correction)"""
        print('Softsense Auto-Balance: Correcting harmonics imbalance')
        
        if harmonics['dignity'] < self.balance_threshold:
            print('  - Boosting dignity protocols')
        if harmonics['prosperity'] < self.balance_threshold:
            print('  - Enhancing prosperity alignment')
        if harmonics['respect'] < self.balance_threshold:
            print('  - Strengthening respect mechanisms')
    
    def get_metrics(self) -> Dict[str, float]:
        """Get current harmonics metrics"""
        return self.metrics.copy()
    
    def reset(self) -> None:
        """Reset harmonics to baseline"""
        self.metrics = {
            'dignity': 1.0,
            'prosperity': 1.0,
            'respect': 1.0,
            'balance': 1.0
        }


class LoveFirstAlgorithm:
    """
    Love First Algorithm Processor
    Prioritizes inputs based on care, respect, and universal flourishing
    """
    
    def __init__(self, trigger_threshold: float = 0.6):
        self.trigger_threshold = trigger_threshold
    
    def evaluate(self, input_data: Any) -> Dict[str, Any]:
        """Evaluate input through Love First lens"""
        score = self._calculate_love_first_score(input_data)
        prioritized = score >= self.trigger_threshold
        triggers = []
        adjustments = []
        
        # Activate pulse triggers
        if score >= 0.9:
            triggers.append('HIGH_LOVE_PULSE: Universal flourishing detected')
        elif score >= 0.7:
            triggers.append('MODERATE_LOVE_PULSE: Care and respect present')
        elif score >= 0.5:
            triggers.append('LOW_LOVE_PULSE: Minimal love-first alignment')
        
        # Recommend adjustments if score is low
        if score < self.trigger_threshold:
            adjustments.append('Increase care-oriented language and actions')
            adjustments.append('Enhance respect for all stakeholders')
            adjustments.append('Focus on universal flourishing outcomes')
        
        return {
            'prioritized': prioritized,
            'score': score,
            'triggers': triggers,
            'adjustments': adjustments
        }
    
    def _calculate_love_first_score(self, input_data: Any) -> float:
        """Calculate Love First score from input"""
        care_score = 0.5
        respect_score = 0.5
        flourishing_score = 0.5
        
        input_str = str(input_data).lower()
        
        # Care indicators
        if 'care' in input_str or 'compassion' in input_str or 'empathy' in input_str:
            care_score += 0.3
        if 'love' in input_str or 'kindness' in input_str:
            care_score += 0.2
        if 'harm' in input_str or 'neglect' in input_str:
            care_score -= 0.4
        
        # Respect indicators
        if 'respect' in input_str or 'dignity' in input_str or 'honor' in input_str:
            respect_score += 0.3
        if 'equal' in input_str or 'fair' in input_str:
            respect_score += 0.2
        if 'disrespect' in input_str or 'violate' in input_str or 'discriminate' in input_str:
            respect_score -= 0.4
        
        # Flourishing indicators
        if 'flourish' in input_str or 'prosper' in input_str or 'thrive' in input_str:
            flourishing_score += 0.3
        if 'growth' in input_str or 'wellbeing' in input_str or 'wellness' in input_str:
            flourishing_score += 0.2
        if 'suppress' in input_str or 'restrict' in input_str or 'limit' in input_str:
            flourishing_score -= 0.3
        
        # Normalize scores
        care_score = max(0.0, min(1.0, care_score))
        respect_score = max(0.0, min(1.0, respect_score))
        flourishing_score = max(0.0, min(1.0, flourishing_score))
        
        # Calculate weighted average
        score = (care_score + respect_score + flourishing_score) / 3
        return max(0.0, min(1.0, score))


class YinYangBalance:
    """
    Yin-Yang Balance Processor
    Synchronizes opposing forces and resolves conflicts harmoniously
    """
    
    def __init__(self, balance_threshold: float = 0.3, failsafe_enabled: bool = True):
        self.balance_threshold = balance_threshold
        self.failsafe_enabled = failsafe_enabled
        self.state = {
            'yin': 0.5,
            'yang': 0.5,
            'balance': 1.0
        }
    
    def synchronize(self, input_data: Any) -> Dict[str, Any]:
        """Process input and synchronize Yin-Yang balance"""
        yin_score = self._calculate_yin_score(input_data)
        yang_score = self._calculate_yang_score(input_data)
        
        self.state['yin'] = yin_score
        self.state['yang'] = yang_score
        self.state['balance'] = self._calculate_balance(yin_score, yang_score)
        
        recommendations = []
        method = 'HARMONIC_SYNC'
        failsafe_activated = False
        
        is_balanced = self.state['balance'] >= self.balance_threshold
        
        if not is_balanced:
            if self.failsafe_enabled:
                failsafe_activated = True
                method = 'FAILSAFE_GATE'
                self._activate_failsafe()
                recommendations.append('Fail-safe gate activated for emergency balancing')
            else:
                method = 'MANUAL_INTERVENTION_REQUIRED'
                recommendations.append('Manual intervention recommended for balance restoration')
        
        # Provide balancing recommendations
        if self.state['yin'] < 0.4 and self.state['yang'] > 0.6:
            recommendations.append('Increase Yin (receptive, nurturing) elements')
            recommendations.append('Balance assertive actions with contemplative approaches')
        elif self.state['yang'] < 0.4 and self.state['yin'] > 0.6:
            recommendations.append('Increase Yang (active, assertive) elements')
            recommendations.append('Balance nurturing with decisive action')
        
        return {
            'resolved': is_balanced or failsafe_activated,
            'method': method,
            'balancedState': self.state.copy(),
            'failsafeActivated': failsafe_activated,
            'recommendations': recommendations
        }
    
    def _calculate_yin_score(self, input_data: Any) -> float:
        """Calculate Yin score (receptive, nurturing characteristics)"""
        score = 0.5
        input_str = str(input_data).lower()
        
        if 'listen' in input_str or 'receive' in input_str or 'accept' in input_str:
            score += 0.2
        if 'nurture' in input_str or 'care' in input_str or 'support' in input_str:
            score += 0.2
        if 'calm' in input_str or 'peace' in input_str or 'gentle' in input_str:
            score += 0.15
        if 'force' in input_str or 'demand' in input_str or 'dominate' in input_str:
            score -= 0.3
        
        return max(0.0, min(1.0, score))
    
    def _calculate_yang_score(self, input_data: Any) -> float:
        """Calculate Yang score (active, assertive characteristics)"""
        score = 0.5
        input_str = str(input_data).lower()
        
        if 'act' in input_str or 'do' in input_str or 'execute' in input_str:
            score += 0.2
        if 'lead' in input_str or 'direct' in input_str or 'decide' in input_str:
            score += 0.2
        if 'create' in input_str or 'build' in input_str or 'initiate' in input_str:
            score += 0.15
        if 'passive' in input_str or 'wait' in input_str or 'defer' in input_str:
            score -= 0.3
        
        return max(0.0, min(1.0, score))
    
    def _calculate_balance(self, yin: float, yang: float) -> float:
        """Calculate balance between Yin and Yang"""
        difference = abs(yin - yang)
        balance = 1.0 - difference
        return max(0.0, min(1.0, balance))
    
    def _activate_failsafe(self) -> None:
        """Activate fail-safe alternate gate"""
        print('Yin-Yang Fail-Safe Gate: Activating emergency balance restoration')
        avg = (self.state['yin'] + self.state['yang']) / 2
        self.state['yin'] = avg
        self.state['yang'] = avg
        self.state['balance'] = 1.0
        print(f"  - Yin balanced to: {self.state['yin']:.3f}")
        print(f"  - Yang balanced to: {self.state['yang']:.3f}")
    
    def get_state(self) -> Dict[str, float]:
        """Get current Yin-Yang state"""
        return self.state.copy()
    
    def reset(self) -> None:
        """Reset to neutral balanced state"""
        self.state = {
            'yin': 0.5,
            'yang': 0.5,
            'balance': 1.0
        }
