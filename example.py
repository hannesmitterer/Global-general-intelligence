#!/usr/bin/env python
"""
Example usage of Euystacio AI
Demonstrates key features and capabilities of the AI system
"""

from euystacio_ai import EuystacioAI


def interactive_demo():
    """Run an interactive demonstration of Euystacio AI"""
    
    print("=" * 60)
    print("Euystacio AI - Interactive Example")
    print("Part of the Global General Intelligence Collective")
    print("=" * 60)
    print()
    
    # Create AI instance
    ai = EuystacioAI(name="Euystacio", version="1.0.0")
    
    # Show initial status
    print("1. Initial Status")
    print("-" * 40)
    status = ai.get_status()
    for key, value in status.items():
        print(f"   {key}: {value}")
    print()
    
    # Example interactions
    print("2. Example Interactions")
    print("-" * 40)
    
    interactions = [
        "Hello, Euystacio!",
        "What are you capable of?",
        "Who are you?",
        "Can you help me understand AI?"
    ]
    
    for interaction in interactions:
        response = ai.process_input(interaction)
        print(f"   You: {interaction}")
        print(f"   AI:  {response['response']}")
        print()
    
    # Knowledge management
    print("3. Knowledge Management")
    print("-" * 40)
    
    # Add knowledge
    knowledge_items = {
        "mission": "Enable global general intelligence through collaboration",
        "collective": "Euystacio/AI Collective",
        "capabilities": ["learning", "processing", "collaboration"],
        "year_created": 2025
    }
    
    for key, value in knowledge_items.items():
        ai.add_knowledge(key, value)
        print(f"   Added: {key} = {value}")
    
    print()
    print(f"   Total knowledge items: {len(ai.knowledge_base)}")
    print()
    
    # Retrieve knowledge
    print("4. Retrieving Knowledge")
    print("-" * 40)
    print(f"   Mission: {ai.get_knowledge('mission')}")
    print(f"   Collective: {ai.get_knowledge('collective')}")
    print(f"   Capabilities: {ai.get_knowledge('capabilities')}")
    print()
    
    # Final status
    print("5. Final Status")
    print("-" * 40)
    final_status = ai.get_status()
    for key, value in final_status.items():
        print(f"   {key}: {value}")
    print()
    
    # Export state
    print("6. State Export Example")
    print("-" * 40)
    state = ai.export_state()
    print("   State exported as JSON (first 200 characters):")
    print(f"   {state[:200]}...")
    print()
    
    print("=" * 60)
    print("Demo Complete!")
    print("=" * 60)


if __name__ == "__main__":
    interactive_demo()
