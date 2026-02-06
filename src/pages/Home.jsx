import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import "../Styles/happiness.css"; 

const API_URL = 'https://script.google.com/macros/s/AKfycbygYriocsZ41SWu0C4zRh9FzpupPQGEsg0I58G6b23McSrfK6DAcLTcx2eSjj9KTrFxJw/exec';
const BASE_EMOJIS = ["🏢", "🔒", "🚗", "🍎", "🍕", "🌈", "😊", "🏀", "👧", "🍦", "📚", "🎸", "🦋", "🐈", "🚀", "💎", "🧸", "🐶", "🌻", "🍟"];
const CORRECT_SEQUENCE = ["🏢", "🔒", "🚗"];
const SCHOOL_LOGO = "https://i.pinimg.com/736x/1c/fc/8b/1cfc8b1ab0460021e731dd82d17abb72.jpg";

export const Home = () => {
    const { store, dispatch } = useGlobalReducer();
    const [step, setStep] = useState(0); 
    const [formData, setFormData] = useState({
        Student_Name: "", Grade: "", 
        P1_Felicidad: null, P2_Salon: null, P3_Socializar: null,
        P4_Patio: null, P5_Profesores: null, P6_Companerismo: null, P7_Ambiente_Familiar: null,
        P8_Profe_Favorito: "", P9_Diferencia_Positiva: "", P10_Sugerencia: ""
    });

    const [syncing, setSyncing] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [adminAuth, setAdminAuth] = useState(false);
    const [userSequence, setUserSequence] = useState([]);
    const [allData, setAllData] = useState([]);
    const [shuffledEmojis, setShuffledEmojis] = useState([]);

    const handleRating = (name, value) => setFormData({ ...formData, [name]: value });

    const fetchResults = async () => {
        try {
            const res = await fetch(`${API_URL}?sheet=Encuestas_Nuevos`);
            const data = await res.json();
            setAllData(data);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async () => {
        if (!formData.P1_Felicidad) {
            alert("¡Por favor marca las caritas antes de enviar! 😊");
            return;
        }
        setStep(2);
        setSyncing(true);
        try {
            await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify({ action: 'registrar_encuesta', sheet: 'Encuestas_Nuevos', data: formData })
            });
            setTimeout(() => {
                setFormData({
                    Student_Name: "", Grade: "", P1_Felicidad: null, P2_Salon: null, P3_Socializar: null,
                    P4_Patio: null, P5_Profesores: null, P6_Companerismo: null, P7_Ambiente_Familiar: null,
                    P8_Profe_Favorito: "", P9_Diferencia_Positiva: "", P10_Sugerencia: ""
                });
                setStep(0);
            }, 3000);
        } catch (err) { console.error(err); }
        finally { setSyncing(false); }
    };

    const handleEmojiClick = (emoji) => {
        const newSeq = [...userSequence, emoji].slice(0, 3);
        setUserSequence(newSeq);
        setShuffledEmojis([...BASE_EMOJIS].sort(() => Math.random() - 0.5));
        if (newSeq.length === 3) {
            if (JSON.stringify(newSeq) === JSON.stringify(CORRECT_SEQUENCE)) {
                setAdminAuth(true);
                fetchResults();
            } else {
                alert("Clave incorrecta ❌");
                setUserSequence([]);
            }
        }
    };

    const generateReport = () => {
        if (allData.length === 0) return null;
        const count = allData.length;
        const sums = { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0, P7: 0 };
        const alerts = [];
        const openAnswers = { P8: [], P9: [], P10: [] };

        allData.forEach(d => {
            sums.P1 += parseInt(d.P1_Felicidad) || 0;
            sums.P2 += parseInt(d.P2_Salon) || 0;
            sums.P3 += parseInt(d.P3_Socializar) || 0;
            sums.P4 += parseInt(d.P4_Patio) || 0;
            sums.P5 += parseInt(d.P5_Profesores) || 0;
            sums.P6 += parseInt(d.P6_Companerismo) || 0;
            sums.P7 += parseInt(d.P7_Ambiente_Familiar) || 0;

            if (d.P8_Profe_Favorito) openAnswers.P8.push({ name: d.Student_Name, text: d.P8_Profe_Favorito });
            if (d.P9_Diferencia_Positiva) openAnswers.P9.push({ name: d.Student_Name, text: d.P9_Diferencia_Positiva });
            if (d.P10_Sugerencia) openAnswers.P10.push({ name: d.Student_Name, text: d.P10_Sugerencia });

            ['P1_Felicidad', 'P3_Socializar'].forEach(k => {
                if (parseInt(d[k]) <= 2) alerts.push(`${d.Student_Name} reporta bajo bienestar en ${k.replace('P1_','').replace('P3_','')}`);
            });
        });

        const avgs = Object.keys(sums).reduce((acc, k) => ({ ...acc, [k]: (sums[k] / count).toFixed(1) }), {});
        const ifg = (Object.values(avgs).reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / 7).toFixed(2);
        
        let status = "", color = "", aiAnalysis = "";

        if (ifg >= 4.2) {
            status = "Nivel Óptimo (Sobresaliente)"; color = "#2ecc71";
            aiAnalysis = "El ecosistema educativo presenta una salud emocional robusta. Los indicadores de 'Felicidad' y 'Ambiente Familiar' sugieren que el modelo pedagógico personalizado está logrando una conexión profunda con los estudiantes. Se recomienda documentar estas prácticas como estándares de éxito. La percepción de los docentes es el pilar de este puntaje, indicando una alta confianza en la autoridad académica.";
        } else if (ifg >= 3.0) {
            status = "Nivel Moderado (En Observación)"; color = "#f1c40f";
            aiAnalysis = "Se detecta un clima institucional estable pero con áreas de fricción operativa. Aunque los niños se sienten cómodos, el análisis de las variables de socialización y espacios físicos (Patio/Salón) sugiere una necesidad de renovación en las dinámicas de recreo. Existe un riesgo latente de desconexión emocional si no se refuerzan las actividades de integración grupal en el corto plazo.";
        } else {
            status = "Nivel Crítico (Acción Urgente)"; color = "#e74c3c";
            aiAnalysis = "ALERTA INSTITUCIONAL: El Índice de Felicidad Global se encuentra por debajo del umbral de bienestar mínimo. Se evidencia una desconexión entre la propuesta del colegio y la experiencia del alumno. Es imperativo realizar mesas de trabajo psicológicas individuales. Los datos sugieren que factores de convivencia o insatisfacción con el entorno físico están afectando severamente el aprendizaje.";
        }

        return { ifg, avgs, alerts, count, status, color, aiAnalysis, openAnswers };
    };

    const report = generateReport();

    return (
        <div className="kids-app">
            {syncing && <div className="sync-top">🚀 Guardando misión secreta...</div>}
            
            <button className="admin-btn-top" onClick={() => { setShowAdmin(true); setShuffledEmojis(BASE_EMOJIS); }}>
                📊 Panel de Control Profes
            </button>

            {step === 0 && (
                <div className="full-screen-container">
                    <div className="step-container">
                        <img src={SCHOOL_LOGO} className="logo-pulse" alt="Logo" />
                        <h1 className="hero-title">¡Hola! Soy Crear</h1>
                        <p className="hero-subtitle">Tu opinión nos ayuda a hacer el colegio más divertido</p>
                        <div className="input-group-kid">
                            <input 
                                className="kid-input-large" 
                                placeholder="Escribe tu nombre aquí..."
                                value={formData.Student_Name}
                                onChange={(e) => setFormData({...formData, Student_Name: e.target.value})}
                            />
                        </div>
                        <button className="kid-btn-giant" onClick={() => setStep(1)}>¡LISTO PARA EMPEZAR! 🚀</button>
                    </div>
                </div>
            )}

            {step === 1 && (
                <div className="survey-layout">
                    <div className="survey-sidebar">
                        <h2>Misión: Felicidad 🌈</h2>
                        <p>Responde cada pregunta marcando la carita que mejor cuente cómo te sientes.</p>
                    </div>
                    
                    <div className="survey-main-content">
                        {[
                            { id: 'P1_Felicidad', label: '1. ¿Qué tan feliz te sientes aquí?', icon: '😊' },
                            { id: 'P2_Salon', label: '2. ¿Te gusta tu salón de clases?', icon: '🏫' },
                            { id: 'P3_Socializar', label: '3. ¿Es fácil hacer amigos?', icon: '🤝' },
                            { id: 'P4_Patio', label: '4. ¿Te gustan las zonas de juego?', icon: '🌳' },
                            { id: 'P5_Profesores', label: '5. ¿Tus profes te ayudan?', icon: '👩‍🏫' },
                            { id: 'P6_Companerismo', label: '6. ¿Tus compañeros son amables?', icon: '👫' },
                            { id: 'P7_Ambiente_Familiar', label: '7. ¿Te gusta el tamaño del colegio?', icon: '🏠' }
                        ].map((q) => (
                            <div className="question-card-modern" key={q.id}>
                                <div className="q-header">
                                    <span className="q-icon">{q.icon}</span>
                                    <p>{q.label}</p>
                                </div>
                                <div className="emoji-rating-modern">
                                    {[1, 2, 3, 4, 5].map(v => (
                                        <button 
                                            key={v} 
                                            className={formData[q.id] === v ? "active" : ""} 
                                            onClick={() => handleRating(q.id, v)}
                                        >
                                            {v === 1 ? "😢" : v === 2 ? "😟" : v === 3 ? "😐" : v === 4 ? "🙂" : "😊"}
                                            <span className="v-label">{v === 5 ? '¡Genial!' : v === 1 ? 'Triste' : ''}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="question-card-modern open-q">
                            <p>8. ¿Quién es tu profe favorito y por qué? 🍎</p>
                            <textarea placeholder="Cuéntanos aquí..." className="kid-text-area" value={formData.P8_Profe_Favorito} onChange={(e) => setFormData({...formData, P8_Profe_Favorito: e.target.value})} />
                        </div>

                        <div className="question-card-modern open-q">
                            <p>9. ¿Qué hace que este colegio sea especial para ti? ✨</p>
                            <textarea placeholder="Cuéntanos qué nos hace diferentes..." className="kid-text-area" value={formData.P9_Diferencia_Positiva} onChange={(e) => setFormData({...formData, P9_Diferencia_Positiva: e.target.value})} />
                        </div>

                        <div className="question-card-modern open-q">
                            <p>10. ¿Qué te haría más feliz aquí? 🧸</p>
                            <textarea placeholder="Tu idea mágica aquí..." className="kid-text-area" value={formData.P10_Sugerencia} onChange={(e) => setFormData({...formData, P10_Sugerencia: e.target.value})} />
                        </div>

                        <button className="kid-btn-finish" onClick={handleSubmit}>¡ENVIAR MI MISIÓN! ✨</button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="full-screen-container">
                    <div className="step-container success-card">
                        <div className="confetti-icon">🎊</div>
                        <h1>¡MISIÓN CUMPLIDA!</h1>
                        <p>Has ayudado a que el colegio sea un lugar mejor.</p>
                        <div className="success-badge">Estudiante Estrella ⭐</div>
                    </div>
                </div>
            )}

            {showAdmin && (
                <div className="modal-overlay">
                    <div className="admin-dashboard">
                        {!adminAuth ? (
                            <div className="auth-box">
                                <h2>Seguridad Docente 🔐</h2>
                                <div className="emoji-grid-auth">
                                    {shuffledEmojis.map((e, i) => (
                                        <button key={i} className="btn-auth" onClick={() => handleEmojiClick(e)}>{e}</button>
                                    ))}
                                </div>
                                <button className="btn-close-dash" onClick={() => setShowAdmin(false)}>Salir</button>
                            </div>
                        ) : (
                            /* ESTRUCTURA CORREGIDA PARA EL SCROLL DEL DASHBOARD */
                            <>
                                <header className="dashboard-header">
                                    <div>
                                        <h1>Análisis de Bienestar Institucional</h1>
                                        <p>Resultados consolidados - {report?.count} Alumnos</p>
                                    </div>
                                    <div className="ifg-circle" style={{ borderColor: report?.color }}>
                                        <span className="ifg-val">{report?.ifg}</span>
                                        <span className="ifg-lbl">IFG Global</span>
                                    </div>
                                </header>

                                <div className="dashboard-grid">
                                    <section className="dashboard-section ai-card">
                                        <h3><span className="icon">🧠</span> Interpretación Predictiva (IA)</h3>
                                        <div className="status-tag" style={{ backgroundColor: report?.color }}>{report?.status}</div>
                                        <p className="ai-text">{report?.aiAnalysis}</p>
                                    </section>

                                    <section className="dashboard-section stats-card">
                                        <h3><span className="icon">📈</span> Promedios Detallados</h3>
                                        <div className="stats-list">
                                            <div className="stat-row"><span>😊 Felicidad</span> <div className="bar"><div className="fill" style={{width: `${(report?.avgs.P1/5)*100}%`}}></div></div> <strong>{report?.avgs.P1}</strong></div>
                                            <div className="stat-row"><span>🏫 Salón</span> <div className="bar"><div className="fill" style={{width: `${(report?.avgs.P2/5)*100}%`}}></div></div> <strong>{report?.avgs.P2}</strong></div>
                                            <div className="stat-row"><span>🤝 Social</span> <div className="bar"><div className="fill" style={{width: `${(report?.avgs.P3/5)*100}%`}}></div></div> <strong>{report?.avgs.P3}</strong></div>
                                            <div className="stat-row"><span>🌳 Patio</span> <div className="bar"><div className="fill" style={{width: `${(report?.avgs.P4/5)*100}%`}}></div></div> <strong>{report?.avgs.P4}</strong></div>
                                        </div>
                                    </section>

                                    <section className="dashboard-section open-answers-card">
                                        <h3><span className="icon">💬</span> Voces de los Estudiantes</h3>
                                        <div className="answers-scroll">
                                            <h4>Profe Favorito (P8):</h4>
                                            {report?.openAnswers.P8.map((a, i) => (
                                                <div key={i} className="quote-item"><strong>{a.name}:</strong> "{a.text}"</div>
                                            ))}
                                            
                                            <h4 className="mt-3">Lo que nos hace especiales (P9):</h4>
                                            {report?.openAnswers.P9.map((a, i) => (
                                                <div key={i} className="quote-item"><strong>{a.name}:</strong> "{a.text}"</div>
                                            ))}

                                            <h4 className="mt-3">Sugerencias para mejorar (P10):</h4>
                                            {report?.openAnswers.P10.map((a, i) => (
                                                <div key={i} className="quote-item suggestion"><strong>{a.name}:</strong> "{a.text}"</div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="dashboard-section alerts-card">
                                        <h3><span className="icon">🚩</span> Casos de Atención</h3>
                                        <div className="alerts-container">
                                            {report?.alerts.map((alt, i) => <div key={i} className="alert-pill">{alt}</div>)}
                                            {report?.alerts.length === 0 && <p className="text-success">No hay alertas críticas registradas.</p>}
                                        </div>
                                    </section>
                                </div>

                                <button className="btn-close-dash" onClick={() => { setAdminAuth(false); setShowAdmin(false); }}>CERRAR PANEL DE ANÁLISIS</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};