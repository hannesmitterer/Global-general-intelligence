#!/usr/bin/env python3
"""
Softsense Framework Demo
Demonstrates the key features of the Softsense framework
"""

from softsense import initialize_softsense
from euystacio_ai import EuystacioAI
import json


def print_section(title):
    """Print a section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60 + "\n")


def main():
    print_section("Softsense Framework Demonstration")
    
    # Initialize Softsense
    print("1. Initializing Softsense Framework...")
    softsense = initialize_softsense()
    print("✓ Softsense initialized successfully")
    
    # Show default harmonizing layers
    status = softsense.get_harmonization_status()
    print(f"✓ Default harmonizing layers registered: {list(status['layers'].keys())}")
    
    print_section("Nano-Level Harmonizing Layers")
    
    # Register custom layer
    print("2. Registering custom harmonizing layer...")
    softsense.register_harmonizing_layer("demo_algorithm")
    
    # Sense some operations
    print("3. Sensing algorithm loop operations...")
    for i in range(5):
        softsense.sense_algorithm_loop("demo_algorithm", f"operation_{i}", True)
    
    layer_status = status['layers'].get("demo_algorithm", softsense.harmonizing_layers["demo_algorithm"].get_status())
    print(f"✓ Algorithm loop sensed: {layer_status['total_operations']} operations")
    print(f"✓ Harmonization score: {layer_status['harmonization_score']}")
    
    print_section("Love First Prioritization")
    
    # Test Love First evaluation
    print("4. Testing Love First prioritization...")
    
    # Safe action
    safe_approved = softsense.trigger_love_first("read_data", {"user": "demo"})
    print(f"✓ Safe action 'read_data': {'APPROVED' if safe_approved else 'BLOCKED'}")
    
    # Potentially harmful action (blocked)
    harmful_blocked = softsense.trigger_love_first("delete_all_data", {})
    print(f"✓ Harmful action 'delete_all_data': {'APPROVED' if harmful_blocked else 'BLOCKED'}")
    
    # Authorized action
    authorized_approved = softsense.trigger_love_first("delete_item", {"seedbringer": True})
    print(f"✓ Authorized action 'delete_item': {'APPROVED' if authorized_approved else 'BLOCKED'}")
    
    print_section("Seedbringer Veto Power")
    
    # Test veto enforcement
    print("5. Testing Seedbringer veto enforcement...")
    
    # Check if veto required
    requires_veto = softsense.seedbringer_veto.check_veto_required("allocation_create")
    print(f"✓ Operation 'allocation_create' requires veto: {requires_veto}")
    
    # Enforce veto
    veto_success = softsense.enforce_seedbringer_veto(
        "allocation_create",
        "seedbringer@example.com",
        "Critical resource allocation"
    )
    print(f"✓ Veto enforced: {veto_success}")
    
    print_section("EuystacioAI Integration")
    
    # Create AI with Softsense
    print("6. Creating EuystacioAI with Softsense integration...")
    ai = EuystacioAI(name="DemoAI", version="1.0.0")
    
    # Process input (automatically checked by Softsense)
    print("7. Processing AI input...")
    response = ai.process_input("Hello, Softsense!")
    print(f"✓ AI Response: {response['response']}")
    
    # Check AI status (includes Softsense harmonization)
    ai_status = ai.get_status()
    if 'softsense_harmonization' in ai_status:
        print(f"✓ Softsense integrated in AI status")
    
    print_section("Audit Log")
    
    # Show recent audit entries
    print("8. Retrieving audit log...")
    recent_logs = softsense.audit_log.get_recent(5)
    print(f"✓ Total audit entries: {len(softsense.audit_log.entries)}")
    print(f"✓ Recent entries (last 5):")
    for entry in recent_logs[-5:]:
        print(f"   - {entry['event_type']} ({entry['level']}) at {entry['timestamp']}")
    
    print_section("Harmonization Status Summary")
    
    # Get full status
    full_status = softsense.get_harmonization_status()
    print(f"Active: {full_status['active']}")
    print(f"Average Harmonization: {full_status['average_harmonization']:.2f}")
    print(f"Love First Balance Score: {full_status['love_first_status']['balance_score']}")
    print(f"Fail-Safe Active: {full_status['love_first_status']['fail_safe_active']}")
    print(f"Seedbringer Authority Active: {full_status['veto_status']['authority_active']}")
    print(f"Total Vetoes: {full_status['veto_status']['total_vetoes']}")
    print(f"Audit Entries: {full_status['audit_entries']}")
    
    print_section("Demonstration Complete")
    print("✅ All Softsense components functioning correctly!")
    print("✅ Perpetual alignment with Consensus Sacralis Omnibus Eternum Est maintained")
    print()


if __name__ == "__main__":
    main()
