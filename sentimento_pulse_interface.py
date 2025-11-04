"""
sentimento_pulse_interface.py - SentimentoPulseInterface for receiving emotional pulses

This module provides an interface for receiving and logging emotional/sentiment pulses
from users or the system.
"""
import json
import os
from datetime import datetime

LOGS_DIR = "logs"

class SentimentoPulseInterface:
    """Interface for receiving and processing sentiment/emotional pulses."""
    
    def __init__(self, logs_dir=LOGS_DIR):
        self.logs_dir = logs_dir
        os.makedirs(self.logs_dir, exist_ok=True)
    
    def receive_pulse(self, emotion, intensity=0.5, clarity="medium", note=""):
        """
        Receive an emotional pulse and log it.
        
        Args:
            emotion: The emotion/feeling expressed (str)
            intensity: Intensity level 0.0 to 1.0 (float)
            clarity: Clarity level - low/medium/high (str)
            note: Optional text note (str)
        
        Returns:
            dict: Event record of the pulse
        """
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "emotion": emotion,
            "intensity": float(intensity),
            "clarity": clarity,
            "note": note,
            "type": "pulse"
        }
        
        # Log to file
        log_file = os.path.join(self.logs_dir, f"log_{datetime.utcnow().strftime('%Y%m%d')}.json")
        
        try:
            # Load existing log or create new
            if os.path.exists(log_file):
                with open(log_file, 'r', encoding='utf-8') as f:
                    log_data = json.load(f)
            else:
                log_data = {}
            
            # Add new pulse with unique key
            pulse_key = f"pulse_{datetime.utcnow().strftime('%H%M%S%f')}"
            log_data[pulse_key] = event
            
            # Write back
            with open(log_file, 'w', encoding='utf-8') as f:
                json.dump(log_data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            # Best effort logging, don't fail the request
            print(f"Warning: Failed to log pulse: {e}")
        
        return event
