import json
import pandas as pd
import bibtexparser
from sentence_transformers import SentenceTransformer, util
import shutil

# -------------------------------
# Configuration
# -------------------------------
TOP_N = 3  # Number of SDGs to assign per paper
BIB_FILE = "../data/export.bib"
SDGS_CSV_FILE = "../data/knowSDGs.csv"
OUTPUT_JSON = "../data/papers.json"
BACKUP_FILE = "../data/papers_backup.json"

# -------------------------------
# Load BibTeX
# -------------------------------
with open(BIB_FILE, "r", encoding="utf-8") as f:
    bib_database = bibtexparser.load(f)

papers = []
for entry in bib_database.entries:
    entry_type = entry.get("ENTRYTYPE", "").lower()
    
    # Map fields depending on type
    if entry_type == "article":
        journal = entry.get("journal", "")
        booktitle = ""
    elif entry_type == "inproceedings":
        journal = ""
        booktitle = entry.get("booktitle", "")
    elif entry_type == "report":
        journal = ""
        booktitle = ""
    else:
        journal = entry.get("journal", "")
        booktitle = entry.get("booktitle", "")

    papers.append({
        "id": entry.get("ID"),
        "title": entry.get("title", ""),
        "author": entry.get("author", ""),
        "year": entry.get("year", ""),
        "publisher": entry.get("publisher", ""),
        "journal": journal,
        "booktitle": booktitle,
        "keywords": [k.strip() for k in entry.get("keywords", "").split(",") if k.strip()],
        "abstract": entry.get("abstract", ""),
        "note": entry.get("note", ""),
        "howpublished": entry.get("howpublished", ""),
        "url": entry.get("url", ""),
        "doi": entry.get("doi", ""),
        "issn": entry.get("issn", ""),
        "issue": entry.get("issue", ""),
        "volume": entry.get("volume", ""),
        "month": entry.get("month", ""),
        "pages": entry.get("pages", ""),
        "entrytype": entry_type,
    })

# -------------------------------
# Load SDG keywords from CSV
# -------------------------------
sdg_df = pd.read_csv(SDGS_CSV_FILE)
sdg_dict = {}
for _, row in sdg_df.iterrows():
    sdg_number = int(row["Target"].split(".")[0])  # e.g. "1.0" → 1
    keywords = [str(k) for k in row.iloc[3:].dropna().values if str(k).strip()]
    if sdg_number not in sdg_dict:
        sdg_dict[sdg_number] = []
    sdg_dict[sdg_number].extend(keywords)

# -------------------------------
# Initialize embedding model
# -------------------------------
model = SentenceTransformer("all-MiniLM-L6-v2")

# Precompute SDG embeddings (combine all keywords into one string per SDG)
sdg_embeddings = {}
for sdg_id, keywords in sdg_dict.items():
    text = " ".join(keywords)
    sdg_embeddings[sdg_id] = model.encode(text, convert_to_tensor=True)

# -------------------------------
# Assign top-N SDGs per paper
# -------------------------------
for paper in papers:
    # Use title + abstract + note + keywords as text
    paper_text = f"{paper['title']} {paper['abstract']} {paper['note']} {' '.join(paper['keywords'])}"
    paper_emb = model.encode(paper_text, convert_to_tensor=True)

    sims = {sdg_id: util.cos_sim(paper_emb, emb).item() for sdg_id, emb in sdg_embeddings.items()}
    top_sdgs = sorted(sims, key=sims.get, reverse=True)[:TOP_N]
    paper["sdgs"] = top_sdgs

# -------------------------------
# Backup old output
# -------------------------------
shutil.copyfile(OUTPUT_JSON, BACKUP_FILE)

# -------------------------------
# Save updated papers with SDGs
# -------------------------------
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(papers, f, ensure_ascii=False, indent=2)

print(f"✅ Papers JSON updated with top {TOP_N} SDGs per paper, including @report entries!")