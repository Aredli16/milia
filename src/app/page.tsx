"use client";

import { useState, useRef, useEffect } from "react";

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}

const PREDEFINED_INGREDIENTS = [
  "Ail", "Aubergines", "Avocat", "Bacon", "Basilic", "Beurre", "Boeuf haché",
  "Brocoli", "Carottes", "Champignons", "Chou-fleur", "Citron", "Concombre",
  "Courgettes", "Crème fraîche", "Crevettes", "Epinards", "Escalope de dinde",
  "Escalope de poulet", "Farine", "Fromage râpé", "Gnocchi à poêler",
  "Haricots verts", "Huile d'olive", "Jambon", "Lait", "Lardons", "Lentilles",
  "Maïs", "Mozzarella", "Oeufs", "Oignons", "Pain", "Pâtes", "Petit pois",
  "Poivrons", "Pommes de terre", "Porc", "Riz", "Salade", "Saumon", "Sel",
  "Sucre", "Thon", "Tomates", "Yaourt"
];

const UNITS = ["Unité(s)", "g", "kg", "ml", "cl", "L", "CàS", "CàC", "Pincée", "N/A"];

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentName, setCurrentName] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState("");
  const [currentUnit, setCurrentUnit] = useState("Unité(s)");
  const [recipe, setRecipe] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredIngredients, setFilteredIngredients] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentName(value);

    if (value.trim() === "") {
      setFilteredIngredients([]);
      setShowSuggestions(false);
    } else {
      const filtered = PREDEFINED_INGREDIENTS.filter(ing =>
        ing.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredIngredients(filtered);
      setShowSuggestions(true);
    }
  };

  const selectIngredient = (name: string) => {
    setCurrentName(name);
    setShowSuggestions(false);
    // Auto-select unit for some ingredients (simple heuristic)
    if (["Sel", "Poivre", "Epices"].includes(name)) setCurrentUnit("N/A");
    else if (["Lait", "Eau", "Crème"].some(l => name.includes(l))) setCurrentUnit("ml");
    else if (["Riz", "Pâtes", "Farine", "Sucre"].includes(name)) setCurrentUnit("g");
  };

  const addIngredient = () => {
    if (currentName.trim()) {
      let qtyDisplay = "";
      if (currentUnit === "N/A") {
        qtyDisplay = "";
      } else {
        if (!currentQuantity.trim()) return; // Require quantity if unit is not N/A
        qtyDisplay = `${currentQuantity} ${currentUnit}`;
      }

      const newIngredient: Ingredient = {
        id: Date.now().toString(),
        name: currentName.trim(),
        quantity: qtyDisplay,
      };
      setIngredients([...ingredients, newIngredient]);
      setCurrentName("");
      setCurrentQuantity("");
      setCurrentUnit("Unité(s)");
      setShowSuggestions(false);
    }
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addIngredient();
    }
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setRecipe(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = await response.json();

      if (response.ok) {
        setRecipe(data.recipe);
      } else {
        setRecipe(`
          <div style="color: #ff4444; background: rgba(255, 68, 68, 0.1); padding: 20px; border-radius: 12px; border: 1px solid #ff4444;">
            <h3>⚠️ Error</h3>
            <p>${data.error || "Something went wrong while generating the recipe."}</p>
            ${data.error === "API Key not configured" ? "<p>Please create a <code>.env.local</code> file with your <code>GEMINI_API_KEY</code>.</p>" : ""}
          </div>
        `);
      }
    } catch (error) {
      setRecipe(`
        <div style="color: #ff4444;">
          <h3>⚠️ Error</h3>
          <p>Failed to connect to the chef.</p>
        </div>
      `);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <header style={{ textAlign: "center", marginBottom: "60px" }} className="animate-fade-in">
        <h1 style={{ fontSize: "3.5rem", marginBottom: "10px", background: "linear-gradient(to right, #fff, #a1a1a1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Smart Kitchen
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.2rem" }}>
          Manage your stock with quantities and cook smarter.
        </p>
      </header>

      <section className="glass-panel animate-fade-in" style={{ padding: "30px", marginBottom: "30px", animationDelay: "0.1s" }}>
        <h2 style={{ marginBottom: "20px" }}>Your Stock</h2>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Autocomplete Wrapper */}
          <div style={{ flex: 3, minWidth: "200px", position: "relative" }} ref={wrapperRef}>
            <input
              type="text"
              className="input-field"
              placeholder="Search ingredient (e.g., Rice)..."
              value={currentName}
              onChange={handleNameChange}
              onFocus={() => {
                if (currentName) setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
            />

            {showSuggestions && filteredIngredients.length > 0 && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                marginTop: "5px",
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 10,
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
              }}>
                {filteredIngredients.map((ing) => (
                  <div
                    key={ing}
                    onClick={() => selectIngredient(ing)}
                    style={{
                      padding: "10px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-highlight)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    {ing}
                  </div>
                ))}
              </div>
            )}
          </div>

          {currentUnit !== "N/A" && (
            <input
              type="number"
              className="input-field"
              placeholder="Qty"
              value={currentQuantity}
              onChange={(e) => setCurrentQuantity(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ flex: 1, minWidth: "80px" }}
            />
          )}

          <select
            className="input-field"
            value={currentUnit}
            onChange={(e) => setCurrentUnit(e.target.value)}
            style={{ flex: 1, minWidth: "100px", cursor: "pointer" }}
          >
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>

          <button onClick={addIngredient} className="btn-primary" style={{ padding: "12px 30px" }}>
            Add
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", minHeight: "50px" }}>
          {ingredients.length === 0 && (
            <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No ingredients in stock.</p>
          )}
          {ingredients.map((ing) => (
            <span key={ing.id} style={{
              background: "rgba(255,255,255,0.1)",
              padding: "8px 16px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              <strong>{ing.name}</strong>
              {ing.quantity && <span style={{ opacity: 0.7, background: "rgba(0,0,0,0.2)", padding: "2px 8px", borderRadius: "10px", fontSize: "0.9em" }}>{ing.quantity}</span>}
              <button
                onClick={() => removeIngredient(ing.id)}
                style={{ background: "none", border: "none", color: "#ff4444", fontSize: "1.2rem", lineHeight: 1, marginLeft: "4px" }}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </section>

      <div className="animate-fade-in" style={{ textAlign: "center", marginBottom: "40px", animationDelay: "0.2s" }}>
        <button
          onClick={generateRecipe}
          disabled={ingredients.length === 0 || loading}
          className="btn-primary"
          style={{
            fontSize: "1.2rem",
            padding: "16px 40px",
            opacity: ingredients.length === 0 ? 0.5 : 1,
            cursor: ingredients.length === 0 ? "not-allowed" : "pointer",
            width: "100%"
          }}
        >
          {loading ? "Chef is thinking..." : "✨ Generate Recipe"}
        </button>
      </div>

      {recipe && (
        <section className="glass-panel animate-fade-in" style={{ padding: "40px", animationDelay: "0.3s", border: "1px solid var(--primary)" }}>
          <div dangerouslySetInnerHTML={{ __html: recipe }} style={{ lineHeight: "1.6" }} />
        </section>
      )}
    </main>
  );
}
