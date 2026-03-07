import { useRef } from "react";
import { BookOpen, ExternalLink, Heart, Phone, Globe } from "lucide-react";

const RESOURCES = [
  {
    category: "Official Organizations",
    emoji: "🏛️",
    color: "bg-blue-50 border-blue-100",
    headerColor: "bg-blue-600",
    items: [
      { name: "Autism Speaks", url: "https://www.autismspeaks.org", desc: "Largest autism science and advocacy organization in the US." },
      { name: "CDC Autism Resources", url: "https://www.cdc.gov/ncbddd/autism", desc: "Learn the Signs. Act Early. Official CDC resources." },
      { name: "ASAN - Autistic Self Advocacy Network", url: "https://autisticadvocacy.org", desc: "Nothing about us without us — led by autistic people." },
      { name: "ASAT - Association for Science in Autism Treatment", url: "https://www.asatonline.org", desc: "Evidence-based autism treatment information." },
    ]
  },
  {
    category: "Early Intervention",
    emoji: "👶",
    color: "bg-green-50 border-green-100",
    headerColor: "bg-green-600",
    items: [
      { name: "IDEA Part C - Early Intervention", url: "https://sites.ed.gov/idea/", desc: "Federal law ensuring services for infants and toddlers with disabilities." },
      { name: "First Signs", url: "https://firstsigns.org", desc: "Dedicated to the early identification of autism and related disorders." },
      { name: "M-CHAT Screening Tool", url: "https://m-chat.org", desc: "Official Modified Checklist for Autism in Toddlers." },
    ]
  },
  {
    category: "Parent Support",
    emoji: "💛",
    color: "bg-yellow-50 border-yellow-100",
    headerColor: "bg-yellow-500",
    items: [
      { name: "Autism Society of America", url: "https://www.autism-society.org", desc: "Local chapters providing support to families nationwide." },
      { name: "SPARK Autism Research", url: "https://sparkforautism.org", desc: "Participate in autism research and connect with community." },
      { name: "Reddit r/autism", url: "https://www.reddit.com/r/autism", desc: "Supportive community for families and autistic individuals." },
    ]
  },
  {
    category: "Therapy Resources",
    emoji: "🧠",
    color: "bg-purple-50 border-purple-100",
    headerColor: "bg-purple-600",
    items: [
      { name: "BACB - Find a BCBA", url: "https://www.bacb.com", desc: "Locate a Board Certified Behavior Analyst in your area." },
      { name: "ASHA Speech-Language Pathology", url: "https://www.asha.org", desc: "Find certified speech-language pathologists near you." },
      { name: "AOTA - Occupational Therapy", url: "https://www.aota.org", desc: "Find occupational therapists who specialize in autism." },
    ]
  },
];

const ARTICLES = [
  {
    emoji: "🔬",
    title: "Understanding ASD: What the Research Says",
    url: "https://www.nimh.nih.gov/health/topics/autism-spectrum-disorders-asd",
    desc: "A comprehensive overview from the NIMH covering symptoms, causes, and the latest scientific research into brain development.",
    readTime: "8 min read",
    category: "Science",
  },
  {
    emoji: "💬",
    title: "How to Talk to Your Child's Pediatrician",
    url: "https://www.cdc.gov/ncbddd/actearly/concerned.html",
    desc: "The CDC's practical guide for parents on how to prepare for appointments and share developmental concerns effectively.",
    readTime: "5 min read",
    category: "Advocacy",
  },
  {
    emoji: "🏫",
    title: "Navigating the IEP Process",
    url: "https://childmind.org/article/navigating-the-iep-process-parent-guide/",
    desc: "A step-by-step roadmap from the Child Mind Institute on securing educational support and understanding your legal rights.",
    readTime: "12 min read",
    category: "Education",
  },
  {
    emoji: "🤝",
    title: "Building Your Support Network",
    url: "https://www.autismspeaks.org/family-support-tool-kits",
    desc: "Strategies for connecting with other families and building a community to support both you and your child's needs.",
    readTime: "6 min read",
    category: "Community",
  },
  {
    emoji: "🍽️",
    title: "Sensory Processing & Mealtime",
    url: "https://www.autismspeaks.org/expert-opinion/seven-tips-managing-autism-related-picking-eating",
    desc: "Expert-backed strategies for managing food sensitivities and sensory challenges during family meals.",
    readTime: "7 min read",
    category: "Daily Life",
  },
  {
    emoji: "😴",
    title: "Sleep Challenges in Autism",
    url: "https://childmind.org/article/autism-and-sleep-issues/",
    desc: "Evidence-based approaches to common sleep disturbances, including behavioral routines and professional solutions.",
    readTime: "9 min read",
    category: "Health",
  },
];

const HOTLINES = [
  { name: "Autism Response Team", number: "888-288-4762", hours: "M-F 9am-9pm ET", emoji: "📞" },
  { name: "Crisis Text Line", number: "Text HOME to 741741", hours: "24/7", emoji: "💬" },
  { name: "Parent to Parent USA", number: "855-827-5465", hours: "M-F 9am-5pm ET", emoji: "🤝" },
];

export default function Resources() {
  const headRef = useRef(null);
  const resourcesRef = useRef(null);
  const articlesRef = useRef(null);

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Header */}
      <div ref={headRef} className="bg-linear-to-br from-purple-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center res-header">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-5xl font-black text-[#2D3748] mb-4">Parent Resources</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Carefully curated resources from trusted organizations to help you understand, navigate, and advocate for your child.
          </p>
        </div>
      </div>

      {/* Hotlines */}
      <div className="bg-linear-to-r from-[#6B8F71] to-[#457B9D] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-white font-black text-xl mb-6 text-center">Support Hotlines</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HOTLINES.map((h) => (
              <div key={h.name} className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 text-white border border-white/20">
                <div className="text-2xl mb-2">{h.emoji}</div>
                <div className="font-bold text-lg">{h.name}</div>
                <div className="text-white/90 font-semibold">{h.number}</div>
                <div className="text-white/70 text-sm mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {h.hours}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div ref={resourcesRef} className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {RESOURCES.map((section) => (
            <div key={section.category} className={`resource-section rounded-2xl border overflow-hidden shadow-sm ${section.color}`}>
              <div className={`${section.headerColor} text-white px-6 py-4 flex items-center gap-3`}>
                <span className="text-2xl">{section.emoji}</span>
                <h3 className="font-black text-lg">{section.category}</h3>
              </div>
              <div className="p-6 space-y-4">
                {section.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 group bg-white rounded-xl p-4 border border-white hover:shadow-md transition-all"
                  >
                    <Globe className="w-5 h-5 text-gray-400 shrink-0 mt-0.5 group-hover:text-blue-500 transition-colors" />
                    <div className="flex-1">
                      <div className="font-bold text-[#2D3748] group-hover:text-blue-600 transition-colors flex items-center gap-1">
                        {item.name}
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div ref={articlesRef} className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <BookOpen className="w-4 h-4" /> Educational Articles
            </div>
            <h2 className="text-4xl font-black text-[#2D3748]">Guides for Parents</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ARTICLES.map((a) => (
              <a
                key={a.title}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="article-card card-hover bg-[#FAFAF7] rounded-2xl border border-gray-100 p-6 block"
              >
                <div className="text-4xl mb-4">{a.emoji}</div>
                <div className="inline-flex items-center gap-1 bg-white border border-gray-200 text-xs font-semibold text-gray-500 px-2.5 py-1 rounded-full mb-3">
                  {a.category}
                </div>
                <h3 className="font-black text-[#2D3748] text-base leading-snug mb-2">{a.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{a.desc}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{a.readTime}</span>
                  <div className="flex items-center gap-1 text-sage font-semibold">
                    Read article <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-800 text-center">
          <Heart className="w-5 h-5 inline mr-2" />
          <strong>A note from our team:</strong> Every child is unique, and a screening score or resource guide is just one piece of the picture.
          Please consult with qualified healthcare professionals for personalized guidance. You are not alone in this journey.
        </div>
      </div>
    </div>
  );
}