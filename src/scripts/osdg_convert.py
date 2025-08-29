import json
import pandas as pd
from sentence_transformers import SentenceTransformer, util
import shutil

# -------------------------------
# Configuration
# -------------------------------
TOP_N = 3  # Number of SDGs to assign per event
EVENTS_FILE = '../data/events.json'
SDGS_CSV_FILE = '../data/knowSDGs.csv'
BACKUP_FILE = '../data/events_backup.json'

# -------------------------------
# Load events JSON
# -------------------------------
with open(EVENTS_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)  # List of event dicts

# -------------------------------
# Load SDG keywords from CSV
# -------------------------------
sdg_df = pd.read_csv(SDGS_CSV_FILE)
sdg_dict = {}
for _, row in sdg_df.iterrows():
    sdg_number = int(row['Target'].split('.')[0])  # e.g., "1.0" -> 1
    keywords = [str(k) for k in row.iloc[3:].dropna().values if str(k).strip()]
    if sdg_number not in sdg_dict:
        sdg_dict[sdg_number] = []
    sdg_dict[sdg_number].extend(keywords)

# -------------------------------
# Initialize embedding model
# -------------------------------
model = SentenceTransformer('all-MiniLM-L6-v2')

# Precompute SDG embeddings (one per SDG using all keywords)
sdg_embeddings = {}
for sdg_id, keywords in sdg_dict.items():
    # Join all keywords into one string per SDG
    text = " ".join(keywords)
    sdg_embeddings[sdg_id] = model.encode(text, convert_to_tensor=True)

# -------------------------------
# Assign top-N SDGs per event
# -------------------------------
for event in data:
    event_text = f"{event.get('title','')} {event.get('description','')}"
    event_emb = model.encode(event_text, convert_to_tensor=True)
    
    # Compute similarity to each SDG
    sims = {sdg_id: util.cos_sim(event_emb, emb).item() for sdg_id, emb in sdg_embeddings.items()}
    
    # Pick top N SDGs
    top_sdgs = sorted(sims, key=sims.get, reverse=True)[:TOP_N]
    event['sdgs'] = top_sdgs

# -------------------------------
# Backup original events.json
# -------------------------------
shutil.copyfile(EVENTS_FILE, BACKUP_FILE)

# -------------------------------
# Save updated events.json
# -------------------------------
with open(EVENTS_FILE, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ Events JSON updated successfully with top {TOP_N} SDG numbers per event!")