import { useState, useRef } from "react";
import { Shield, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import compass from "../assets/compass.png";

const QUESTIONS = [
  { id: "q1", text: "Does your child make eye contact when you talk to them?", category: "social" },
  { id: "q2", text: "Does your child respond to their name being called?", category: "social" },
  { id: "q3", text: "Does your child point to objects to show interest (e.g., a bird or toy)?", category: "communication" },
  { id: "q4", text: "Does your child imitate actions or sounds you make?", category: "imitation" },
  { id: "q5", text: "Does your child play pretend (e.g., feeding a doll or using a toy phone)?", category: "play" },
  { id: "q6", text: "Does your child show objects to other people to share interest?", category: "communication" },
  { id: "q7", text: "Does your child use words to communicate (or babble if under 12 months)?", category: "language" },
  { id: "q8", text: "Does your child seem bothered by loud noises more than other children?", category: "sensory", reverse: true },
  { id: "q9", text: "Does your child follow your finger when you point at something?", category: "social" },
  { id: "q10", text: "Does your child engage in repetitive movements (rocking, hand flapping)?", category: "behavior", reverse: true },
  { id: "q11", text: "Does your child smile back at you when you smile at them?", category: "social" },
  { id: "q12", text: "Does your child seem interested in other children?", category: "social" },
];

const OPTIONS = ["Always", "Usually", "Sometimes", "Rarely", "Never"];


/* ---------------------- STATIC SCORING FUNCTION ---------------------- */

function calculateRisk(answers) {

  const scoreMap = {
    Always: 0,
    Usually: 0,
    Sometimes: 1,
    Rarely: 1,
    Never: 1
  };

  let score = 0;

  QUESTIONS.forEach(q => {
    const ans = answers[q.id];
    if (!ans) return;

    let value = scoreMap[ans];

    if (q.reverse) {
      value = value === 0 ? 1 : 0;
    }

    score += value;
  });

  if (score <= 2) {
    return {
      risk_level: "low",
      summary:
        "Your responses suggest typical developmental patterns. Most answers indicate behaviors commonly seen in children developing social and communication skills. Continue observing your child's development and encourage interaction and play.",
      key_observations: [
        "Most responses indicate typical developmental behaviors.",
        "Social interaction appears within expected range.",
        "Communication indicators appear age appropriate."
      ],
      next_steps: [
        "Continue engaging your child in play and communication.",
        "Monitor developmental milestones as your child grows.",
        "Discuss any concerns during routine pediatric visits."
      ]
    };
  }

  if (score <= 7) {
    return {
      risk_level: "moderate",
      summary:
        "Some responses suggest areas that may benefit from further observation. Children develop at different rates, but discussing these results with your pediatrician may help determine whether further screening would be helpful.",
      key_observations: [
        "Some responses suggest developmental differences.",
        "Certain social or communication behaviors may need monitoring.",
        "Discussion with a pediatrician may provide helpful guidance."
      ],
      next_steps: [
        "Discuss the results with your pediatrician.",
        "Observe your child's social interaction and communication.",
        "Consider repeating screening in several months."
      ]
    };
  }

  return {
    risk_level: "high",
    summary:
      "Several responses suggest developmental patterns that may benefit from professional evaluation. This does not mean your child has autism, but it may be helpful to seek guidance from a pediatrician or developmental specialist.",
    key_observations: [
      "Multiple responses suggest possible developmental concerns.",
      "Social or communication behaviors may need closer evaluation.",
      "Early evaluation can help identify helpful support."
    ],
    next_steps: [
      "Schedule a developmental screening with your pediatrician.",
      "Ask about referral to a developmental specialist.",
      "Early evaluation can help identify appropriate support."
    ]
  };
}

/* --------------------------------------------------------------------- */


export default function Screening() {

  const [step, setStep] = useState("consent");
  const [consent, setConsent] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const questionRef = useRef(null);

  const handleAnswer = (answer) => {

    const newAnswers = {
      ...answers,
      [QUESTIONS[currentQ].id]: answer
    };

    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      submitScreening(newAnswers);
    }
  };


  const submitScreening = async (finalAnswers) => {

    setStep("loading");
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResult = calculateRisk(finalAnswers);

    setResult(aiResult);
    setLoading(false);
    setStep("results");
  };


  const progress = Math.round((currentQ / QUESTIONS.length) * 100);

  const riskConfig = {

    low: {
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
      icon: <CheckCircle className="w-10 h-10 text-green-500" />,
      label: "Low Concern",
      desc: "Your responses suggest typical developmental patterns."
    },

    moderate: {
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      icon: <AlertTriangle className="w-10 h-10 text-amber-500" />,
      label: "Some Areas to Watch",
      desc: "Some responses suggest areas worth discussing with your pediatrician."
    },

    high: {
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
      icon: <AlertCircle className="w-10 h-10 text-red-500" />,
      label: "Recommend Evaluation",
      desc: "We recommend scheduling an evaluation with a specialist."
    }

  };


  return (

    <div className="min-h-screen bg-linear-to-br from-green-50 via-blue-50 to-purple-50 py-16 px-4">

      <div className="max-w-2xl mx-auto">

        {/* CONSENT STEP */}

        {step === "consent" && (

          <div className="screening-card bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">

            <div className="text-center mb-8">
                <div className="mx-auto">
                  <img src={compass} alt="Hedgehog Compass" className="block w-18 h-18 mx-auto" />
                </div>
              <h1 className="text-3xl font-black text-[#2D3748] mb-2">
                Free Developmental Screening
              </h1>
              <p className="text-gray-600">
                This questionnaire takes about 5 minutes.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">

              <div className="flex items-center gap-2 font-bold text-green-800 mb-2">
                <Shield className="w-5 h-5" />
                HIPAA Privacy Notice
              </div>

              <p className="text-sm text-green-700 leading-relaxed">
                Your child's information is protected under HIPAA. Data is encrypted in transit and at rest. We never share identifying information with third parties without your explicit consent. This screening tool is for informational purposes only and does not constitute a medical diagnosis.
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Child's First Name (optional)</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="e.g. Alex" value={childName} onChange={(e) => setChildName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Child's Age (months) *</label>
                <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="e.g. 24" value={childAge} onChange={(e) => setChildAge(e.target.value)} required />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Your Email (optional)</label>
              <input type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="parent@email.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
            </div>

            <label className="flex items-start gap-3 mb-8">

              <input
                type="checkbox"
                checked={consent}
                onChange={(e)=>setConsent(e.target.checked)}
              />

              <span className="text-sm">
                I understand this screening is not a medical diagnosis.
              </span>

            </label>

            <button
              onClick={()=>{if(consent && childAge) setStep("questions")}}
              disabled={!consent || !childAge}
              className="btn-primary w-full justify-center text-center text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start Screening
              <ChevronRight className="w-5 h-5 inline ml-1"/>
            </button>

          </div>

        )}


        {/* QUESTIONS */}

        {step === "questions" && (

          <div className="screening-card">

            <div className="mb-6">

              <div className="flex justify-between text-sm mb-2">
                <span>Question {currentQ+1} of {QUESTIONS.length}</span>
                <span>{progress}%</span>
              </div>

              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{width:`${progress}%`}}
                />
              </div>

            </div>

            <div ref={questionRef} className="bg-white p-8 rounded-3xl shadow-2xl">

              <h2 className="text-xl font-bold mb-8">
                {QUESTIONS[currentQ].text}
              </h2>

              <div className="space-y-3">

                {OPTIONS.map(opt=>(
                  <button
                    key={opt}
                    onClick={()=>handleAnswer(opt)}
                    className="w-full border rounded-xl px-5 py-4 text-left"
                  >
                    {opt}
                  </button>
                ))}

              </div>

              {currentQ>0 && (
                <button
                  onClick={() => {
                    setCurrentQ((q) => q - 1);
                  }}
                  className="mt-6 text-sm text-gray-500 flex items-center gap-1"
                >
                  <ChevronLeft/> Previous
                </button>
              )}

            </div>

          </div>

        )}


        {/* LOADING */}

        {step==="loading" && (

          <div className="screening-card bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
            <div className="text-6xl mb-6 float"><img src={compass} alt="Hedgehog Compass" className="w-10 h-10" /></div>
            <Loader2 className="animate-spin w-10 h-10 mx-auto mb-4"/>

            <h2 className="text-2xl font-black mb-2">
              Analyzing responses...
            </h2>

          </div>

        )}


        {/* RESULTS */}

        {step==="results" && result && (

          <div className="screening-card space-y-6">

            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-center">
              <div className="text-6xl mb-4"><img src={compass} alt="Hedgehog Compass" className="w-18 h-18 mx-auto" /></div>
              <h1 className="text-3xl font-black text-[#2D3748] mb-2">Screening Complete</h1>
              {childName && <p className="text-gray-500 mb-4">Results for <strong>{childName}</strong>,
                age <strong>{childAge}</strong> months</p>}

              <div className={`inline-flex items-center gap-3 ${riskConfig[result.risk_level].bg} border rounded-xl px-6 py-4`}>

                {riskConfig[result.risk_level].icon}

                <div className="text-left">

                  <div className={`font-bold ${riskConfig[result.risk_level].color}`}>
                    {riskConfig[result.risk_level].label}
                  </div>

                  <div className="text-sm text-gray-600">
                    {riskConfig[result.risk_level].desc}
                  </div>

                </div>

              </div>

            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-xl font-black text-[#2D3748] mb-4">Summary</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{result.summary}</p>
            </div>

            {result.key_observations?.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-xl font-black text-[#2D3748] mb-4">Key Observations</h2>
                <ul className="space-y-2">
                  {result.key_observations.map((obs, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" /> {obs}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.next_steps?.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-xl font-black text-[#2D3748] mb-4">Recommended Next Steps</h2>
                <ol className="space-y-3">
                  {result.next_steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6B8F71] to-[#457B9D] text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
              <strong>⚠️ Important Disclaimer:</strong> This screening tool is for informational purposes only and does not provide a medical diagnosis. Always consult a licensed healthcare provider, developmental pediatrician, or child psychologist for professional evaluation.
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setStep("consent"); setAnswers({}); setCurrentQ(0); setResult(null); }} className="btn-secondary flex-1 text-center">
                Take Again
              </button>
              <a href={createPageUrl ? undefined : "#"} onClick={() => window.location.href = createPageUrl?.("FindCenters") || "#"} className="btn-primary flex-1 text-center justify-center">
                Find Centers Near Me
              </a>
            </div>

          </div>

        )}

      </div>

    </div>
  )
}

function createPageUrl(name) {
  return `/${name}`;
}