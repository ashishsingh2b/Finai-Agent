import re
import unicodedata

def normalize_label(text: str) -> str:
    """
    Normalizes a label for robust matching:
    1. Removes accents (unicodedata)
    2. Converts to lowercase
    3. Removes non-alphanumeric characters (except spaces)
    4. Strips leading/trailing whitespace
    """
    if not text:
        return ""
    
    # Remove accents
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    
    # Lowercase
    text = text.lower()
    
    # Remove symbols but keep spaces
    text = re.sub(r'[^a-z0-9\s]', '', text)
    
    # Strip and collapse spaces
    text = " ".join(text.split())
    
    return text

def is_match(text: str, keywords: list) -> bool:
    """
    Checks if normalized text matches any of the normalized keywords.
    Matches if the keyword is contained in the text or vice-versa.
    """
    norm_text = normalize_label(text)
    for kw in keywords:
        norm_kw = normalize_label(kw)
        if norm_kw in norm_text or norm_text in norm_kw:
            return True
    return False
