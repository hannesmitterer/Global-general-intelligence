"""
Softsense Framework - Perpetual Alignment System
Ensures harmonization with the Consensus Sacralis Omnibus Eternum Est

This module implements:
1. Nano-Level Harmonizing Layers - sensing core algorithm loops
2. Love First prioritization triggers with auditable fail-safe balance
3. Seedbringer Veto power enforcement within system cuts
"""

import json
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime
from enum import Enum


class HarmonizationLevel(Enum):
    """Harmonization levels for Softsense monitoring"""
    NANO = "nano"
    MICRO = "micro"
    MACRO = "macro"


class PriorityTrigger(Enum):
    """Love First prioritization triggers"""
    LOVE_FIRST = "love_first"
    COMPASSION = "compassion"
    BALANCE = "balance"
    VETO_OVERRIDE = "veto_override"


class SoftsenseAuditLog:
    """Auditable log for Softsense operations"""
    
    def __init__(self):
        self.entries: List[Dict[str, Any]] = []
    
    def log(self, event_type: str, details: Dict[str, Any], level: HarmonizationLevel):
        """Log a Softsense event with timestamp"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            "level": level.value,
            "details": details
        }
        self.entries.append(entry)
    
    def get_recent(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent audit log entries"""
        return self.entries[-limit:]
    
    def export(self) -> str:
        """Export audit log as JSON"""
        return json.dumps(self.entries, indent=2)


class NanoHarmonizingLayer:
    """
    Nano-Level Harmonizing Layer
    Senses and monitors core algorithm loops for alignment
    """
    
    def __init__(self, name: str):
        self.name = name
        self.monitored_operations: Dict[str, int] = {}
        self.harmonization_score: float = 1.0
        self.active = True
    
    def sense_operation(self, operation_name: str, success: bool = True):
        """Sense and record an operation in the algorithm loop"""
        if operation_name not in self.monitored_operations:
            self.monitored_operations[operation_name] = 0
        
        self.monitored_operations[operation_name] += 1
        
        # Adjust harmonization score based on success
        if success:
            self.harmonization_score = min(1.0, self.harmonization_score + 0.01)
        else:
            self.harmonization_score = max(0.0, self.harmonization_score - 0.05)
    
    def get_status(self) -> Dict[str, Any]:
        """Get current harmonization status"""
        return {
            "name": self.name,
            "active": self.active,
            "harmonization_score": self.harmonization_score,
            "operations_count": len(self.monitored_operations),
            "total_operations": sum(self.monitored_operations.values())
        }


class LoveFirstTrigger:
    """
    Love First Prioritization Trigger
    Ensures operations align with compassion and balance principles
    """
    
    def __init__(self):
        self.priority_queue: List[Dict[str, Any]] = []
        self.fail_safe_threshold: float = 0.7
        self.balance_score: float = 1.0
    
    def evaluate_action(self, action: str, context: Dict[str, Any]) -> bool:
        """
        Evaluate if an action aligns with Love First principles
        Returns True if action should proceed
        """
        # Check if action promotes compassion and balance
        compassion_check = self._check_compassion(action, context)
        balance_check = self.balance_score >= self.fail_safe_threshold
        
        return compassion_check and balance_check
    
    def _check_compassion(self, action: str, context: Dict[str, Any]) -> bool:
        """Internal compassion alignment check"""
        # Implementation of compassion principles
        # For now, a basic check - can be extended with more sophisticated logic
        
        # Allow legitimate operations in proper context
        if context.get("authorized") or context.get("seedbringer"):
            return True
        
        harmful_keywords = ["harm", "damage", "destroy", "delete", "remove"]
        return not any(keyword in action.lower() for keyword in harmful_keywords)
    
    def trigger(self, trigger_type: PriorityTrigger, action: str, context: Dict[str, Any]):
        """Trigger a prioritized action"""
        trigger_entry = {
            "trigger_type": trigger_type.value,
            "action": action,
            "context": context,
            "timestamp": datetime.now().isoformat()
        }
        self.priority_queue.append(trigger_entry)
    
    def get_balance_status(self) -> Dict[str, Any]:
        """Get current balance and fail-safe status"""
        return {
            "balance_score": self.balance_score,
            "fail_safe_threshold": self.fail_safe_threshold,
            "fail_safe_active": self.balance_score >= self.fail_safe_threshold,
            "pending_triggers": len(self.priority_queue)
        }


class SeedbringerVeto:
    """
    Seedbringer Veto Power Enforcement
    Ensures Seedbringer authority is preserved in critical system operations
    """
    
    def __init__(self):
        self.veto_log: List[Dict[str, Any]] = []
        self.seedbringer_authority: bool = True
        self.critical_operations: List[str] = []
    
    def enforce_veto(self, operation: str, seedbringer_email: str, reason: str) -> bool:
        """
        Enforce Seedbringer veto on an operation
        Returns True if veto is successful
        """
        if not self.seedbringer_authority:
            return False
        
        veto_entry = {
            "operation": operation,
            "seedbringer": seedbringer_email,
            "reason": reason,
            "timestamp": datetime.now().isoformat(),
            "enforced": True
        }
        self.veto_log.append(veto_entry)
        self.critical_operations.append(operation)
        
        return True
    
    def check_veto_required(self, operation: str) -> bool:
        """Check if operation requires Seedbringer veto approval"""
        critical_keywords = ["allocation", "critical", "system", "delete", "modify"]
        return any(keyword in operation.lower() for keyword in critical_keywords)
    
    def get_veto_status(self) -> Dict[str, Any]:
        """Get veto system status"""
        return {
            "authority_active": self.seedbringer_authority,
            "total_vetoes": len(self.veto_log),
            "critical_operations": len(self.critical_operations),
            "recent_vetoes": self.veto_log[-10:] if self.veto_log else []
        }


class SoftsenseFramework:
    """
    Main Softsense Framework
    Orchestrates all Softsense components for perpetual alignment
    """
    
    def __init__(self):
        self.audit_log = SoftsenseAuditLog()
        self.harmonizing_layers: Dict[str, NanoHarmonizingLayer] = {}
        self.love_first = LoveFirstTrigger()
        self.seedbringer_veto = SeedbringerVeto()
        self.initialized_at = datetime.now().isoformat()
        self.active = True
    
    def register_harmonizing_layer(self, name: str) -> NanoHarmonizingLayer:
        """Register a new Nano-Level Harmonizing Layer"""
        layer = NanoHarmonizingLayer(name)
        self.harmonizing_layers[name] = layer
        
        self.audit_log.log(
            "harmonizing_layer_registered",
            {"layer_name": name},
            HarmonizationLevel.NANO
        )
        
        return layer
    
    def sense_algorithm_loop(self, layer_name: str, operation: str, success: bool = True):
        """Sense an algorithm loop operation through a harmonizing layer"""
        if layer_name not in self.harmonizing_layers:
            self.register_harmonizing_layer(layer_name)
        
        layer = self.harmonizing_layers[layer_name]
        layer.sense_operation(operation, success)
        
        self.audit_log.log(
            "algorithm_loop_sensed",
            {
                "layer": layer_name,
                "operation": operation,
                "success": success,
                "harmonization_score": layer.harmonization_score
            },
            HarmonizationLevel.NANO
        )
    
    def trigger_love_first(self, action: str, context: Optional[Dict[str, Any]] = None) -> bool:
        """
        Trigger Love First evaluation for an action
        Returns True if action is approved
        """
        context = context or {}
        
        approved = self.love_first.evaluate_action(action, context)
        
        self.audit_log.log(
            "love_first_evaluation",
            {
                "action": action,
                "approved": approved,
                "balance_score": self.love_first.balance_score
            },
            HarmonizationLevel.MICRO
        )
        
        if approved:
            self.love_first.trigger(PriorityTrigger.LOVE_FIRST, action, context)
        
        return approved
    
    def enforce_seedbringer_veto(self, operation: str, seedbringer_email: str, reason: str) -> bool:
        """
        Enforce Seedbringer veto on an operation
        Returns True if veto is successful
        """
        success = self.seedbringer_veto.enforce_veto(operation, seedbringer_email, reason)
        
        self.audit_log.log(
            "seedbringer_veto_enforced",
            {
                "operation": operation,
                "seedbringer": seedbringer_email,
                "reason": reason,
                "success": success
            },
            HarmonizationLevel.MACRO
        )
        
        return success
    
    def get_harmonization_status(self) -> Dict[str, Any]:
        """Get overall Softsense harmonization status"""
        layer_statuses = {
            name: layer.get_status()
            for name, layer in self.harmonizing_layers.items()
        }
        
        avg_harmonization = (
            sum(layer.harmonization_score for layer in self.harmonizing_layers.values()) 
            / len(self.harmonizing_layers)
        ) if self.harmonizing_layers else 1.0
        
        return {
            "active": self.active,
            "initialized_at": self.initialized_at,
            "layers": layer_statuses,
            "average_harmonization": avg_harmonization,
            "love_first_status": self.love_first.get_balance_status(),
            "veto_status": self.seedbringer_veto.get_veto_status(),
            "audit_entries": len(self.audit_log.entries)
        }
    
    def export_full_state(self) -> str:
        """Export complete Softsense framework state"""
        state = {
            "softsense_framework": {
                "status": self.get_harmonization_status(),
                "audit_log": self.audit_log.entries[-100:]  # Last 100 entries
            }
        }
        return json.dumps(state, indent=2)


# Global Softsense instance
_softsense_instance: Optional[SoftsenseFramework] = None


def get_softsense() -> SoftsenseFramework:
    """Get or create the global Softsense framework instance"""
    global _softsense_instance
    if _softsense_instance is None:
        _softsense_instance = SoftsenseFramework()
    return _softsense_instance


def initialize_softsense() -> SoftsenseFramework:
    """Initialize the Softsense framework"""
    softsense = get_softsense()
    
    # Register default harmonizing layers
    softsense.register_harmonizing_layer("core_intelligence")
    softsense.register_harmonizing_layer("knowledge_processing")
    softsense.register_harmonizing_layer("interaction_handler")
    
    return softsense
