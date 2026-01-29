"""
Data Normalization: Semantic and Numerical Pre-processing.
Provides low-level functions for cleansing labels and formatting numerical strings 
to ensure robust matching in financial parsers.
"""
import re
import unicodedata

def normalize_label(text: str) -> str:
    """
    Cleanses strings for semantic keyword comparison.
    Standardizes case, removes accents, and collapses whitespace to ensure 
    matching across various accounting software exports.
    """
    if not text:
        return ""
    
    # Remove vertical separators and handle OCR artifacts
    text = text.replace('\n', ' ').replace('\r', ' ')
    
    # Unify character set by stripping diacritics
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    text = text.lower()
    
    # Strip symbols that frequently clutter accounting exports
    text = re.sub(r'[\$\%\,\(\)\*\-\_]', ' ', text)
    text = re.sub(r'[^a-z0-9\s]', '', text)
    
    return " ".join(text.split()).strip()

def normalize_number(value_str: str) -> float:
    """
    Translates accounting string notations into standard floats.
    Handles parentheses as negative symbols and handles localization symbols common 
    in Mexican and US systems.
    """
    if not value_str or str(value_str).strip() == "":
        return 0.0
        
    try:
        clean = str(value_str).strip()
        
        # Detect negative accounting notation: (123.45) or -123.45
        is_negative = False
        if (clean.startswith('(') and clean.endswith(')')) or clean.startswith('-'):
            is_negative = True
            clean = re.sub(r'[\(\)\-]', '', clean)
            
        # Strip all formatting except for decimals and digits
        clean = re.sub(r'[^\d\.]', '', clean)
        
        if not clean:
            return 0.0
            
        val = float(clean)
        return -val if is_negative else val
    except (ValueError, TypeError):
        return 0.0

def is_match(text: str, keywords: list) -> bool:
    """
    Performs a bidirectional substring match between normalized inputs.
    Ensures 'Total Assets' matches 'Assets, Total' regardless of syntax variation.
    """
    norm_text = normalize_label(text)
    if not norm_text:
        return False
        
    for kw in keywords:
        norm_kw = normalize_label(kw)
        if not norm_kw:
            continue
        if norm_kw in norm_text or norm_text in norm_kw:
            return True
    return False
 
