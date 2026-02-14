'use client';

import { useState, useRef, useEffect, memo } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, PartyPopper, Quote, Play, ChevronLeft, ChevronRight, Send, Loader2, Calendar, Clock, BookOpen, Star, Coffee, Music, Smile, MessageCircle, X, Pause } from "lucide-react";
import confetti from "canvas-confetti";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Love Quiz Questions
const quizQuestions = [
  {
    question: "What's the first thing I noticed about you?",
    options: ["Your eyes", "Your smile", "Your laugh", "Your voice"],
    correctIndex: 1,
    response: "That smile could light up any room! 😍",
  },
  {
    question: "What's our song?",
    options: ["Perfect - Ed Sheeran", "All of Me - John Legend", "Thinking Out Loud", "A Thousand Years"],
    correctIndex: 1,
    response: "Because ALL of me loves ALL of you! 🎵",
  },
  {
    question: "What's my favorite thing we do together?",
    options: ["Movie nights", "Cooking together", "Long walks", "Just talking for hours"],
    correctIndex: 3,
    response: "I could talk to you forever and never get bored 💬",
  },
  {
    question: "What do I love most about you?",
    options: ["Your kindness", "Your humor", "Your strength", "Everything!"],
    correctIndex: 3,
    response: "Trick question — it's literally everything about you! 💕",
  },
  {
    question: "Where do I dream of taking you?",
    options: ["Paris", "Maldives", "Japan", "Anywhere with you"],
    correctIndex: 3,
    response: "Home is wherever I'm with you 🌍❤️",
  },
];

// --- Background Music Component (AUTOPLAY) ---
const BackgroundMusic = memo(({ onAudioRef }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasTriedAutoplay = useRef(false);

  useEffect(() => {
    if (onAudioRef && audioRef.current) {
      onAudioRef(audioRef.current);
    }
    
    const tryPlay = () => {
      if (audioRef.current && !hasTriedAutoplay.current) {
        hasTriedAutoplay.current = true;
        
        // Set volume first
        audioRef.current.volume = 0.7;
        
        // Try to play
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              console.log('🎵 Music started playing automatically');
            })
            .catch(error => {
              console.log('⚠️ Autoplay blocked by browser. Music will play on first interaction.', error);
              setIsPlaying(false);
            });
        }
      }
    };

    // Try immediately
    tryPlay();

    // Try again after a short delay
    const timeout1 = setTimeout(tryPlay, 100);
    const timeout2 = setTimeout(tryPlay, 500);

    // Setup interaction listeners as backup
    const startOnInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            console.log('🎵 Music started after user interaction');
            // Remove all listeners once playing
            removeListeners();
          })
          .catch(e => console.log('Failed to play:', e));
      }
    };

    const removeListeners = () => {
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('touchstart', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
      document.removeEventListener('scroll', startOnInteraction);
      document.removeEventListener('mousemove', startOnInteraction);
    };

    // Add multiple event listeners to catch any interaction
    document.addEventListener('click', startOnInteraction);
    document.addEventListener('touchstart', startOnInteraction);
    document.addEventListener('keydown', startOnInteraction);
    document.addEventListener('scroll', startOnInteraction);
    document.addEventListener('mousemove', startOnInteraction, { once: true });

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      removeListeners();
    };
  }, [onAudioRef, isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.log('Play failed:', e));
      }
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/JVKE - golden hour (instrumental).mp3"
        loop
        autoPlay
        preload="auto"
        playsInline
        className="hidden"
      />
      
      {/* Music Toggle Button */}
      <button
        onClick={togglePlay}
        className="fixed top-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-pink-400/50 transition-all hover:scale-110"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? <Pause size={24} /> : <Music size={24} />}
      </button>
    </>
  );
});

// --- 3D FLOWER PETALS (BACKGROUND ONLY) ---
const ThreeDFlowerPetals = memo(() => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const petalsRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const petals = [];

    const loader = new GLTFLoader();
    loader.load(
      '/models/rose_flower_realistic_high-poly (1).glb',
      (gltf) => {
        const roseModel = gltf.scene;
        const meshes = [];
        roseModel.traverse((child) => {
          if (child.isMesh) {
            meshes.push(child);
          }
        });
        
        const petalCount = 30;
        
        for (let i = 0; i < petalCount; i++) {
          let petalMesh;
          
          if (meshes.length > 0) {
            const sourceMesh = meshes[Math.floor(Math.random() * meshes.length)];
            petalMesh = sourceMesh.clone();
            
            if (sourceMesh.material) {
              petalMesh.material = petalMesh.material.clone();
              petalMesh.material.transparent = true;
              petalMesh.material.opacity = 0.9;
              petalMesh.material.side = THREE.DoubleSide;
            }
          } else {
            petalMesh = roseModel.clone();
          }
          
          const scale = 3.0 + Math.random() * 1.5;
          petalMesh.scale.set(scale, scale, scale);
          petalMesh.position.x = (Math.random() - 0.5) * 60;
          petalMesh.position.y = Math.random() * 50 + 10;
          petalMesh.position.z = (Math.random() - 0.5) * 20;
          petalMesh.rotation.x = Math.random() * Math.PI * 2;
          petalMesh.rotation.y = Math.random() * Math.PI * 2;
          petalMesh.rotation.z = Math.random() * Math.PI * 2;

          petalMesh.userData = {
            velocityY: -0.02 - Math.random() * 0.03,
            velocityX: (Math.random() - 0.5) * 0.02,
            velocityZ: (Math.random() - 0.5) * 0.02,
            rotationSpeedX: (Math.random() - 0.5) * 0.02,
            rotationSpeedY: (Math.random() - 0.5) * 0.02,
            rotationSpeedZ: (Math.random() - 0.5) * 0.01,
            swayAmplitude: Math.random() * 0.5 + 0.3,
            swaySpeed: Math.random() * 0.02 + 0.01,
            swayOffset: Math.random() * Math.PI * 2,
          };

          scene.add(petalMesh);
          petals.push(petalMesh);
        }
        
        petalsRef.current = petals;
      },
      undefined,
      (error) => {
        console.error('Error loading rose model:', error);
      }
    );

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      petalsRef.current.forEach((petal) => {
        const userData = petal.userData;
        const time = Date.now() * 0.001;

        petal.position.y += userData.velocityY;
        petal.position.x += Math.sin(time * userData.swaySpeed + userData.swayOffset) * userData.swayAmplitude * 0.02;
        petal.rotation.x += userData.rotationSpeedX;
        petal.rotation.y += userData.rotationSpeedY;

        if (petal.position.y < -30) {
          petal.position.y = Math.random() * 20 + 30;
          petal.position.x = (Math.random() - 0.5) * 60;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      petalsRef.current.forEach((petal) => {
        if (petal.geometry) petal.geometry.dispose();
        if (petal.material) petal.material.dispose();
        scene.remove(petal);
      });

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ touchAction: 'none' }}
    />
  );
});

// --- FLOATING HEARTS ---
const FloatingHearts = memo(() => {
  const hearts = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 15 + Math.random() * 5,
    size: 16 + Math.random() * 12,
    opacity: 0.1 + Math.random() * 0.15,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute will-change-transform"
          style={{
            left: `${heart.x}%`,
            bottom: "-50px",
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: "-120vh",
            opacity: [0, heart.opacity, heart.opacity, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Heart
            size={heart.size}
            className="text-pink-400 fill-pink-400/20"
            strokeWidth={1.5}
          />
        </motion.div>
      ))}
    </div>
  );
});

// --- HERO SECTION ---
const HeroSection = memo(() => {
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ec4899", "#f9a8d4", "#fb7185"],
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full bg-pink-300/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 md:w-80 md:h-80 rounded-full bg-rose-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="flex justify-center mb-8"
        >
          <Heart 
            size={80}
            className="text-pink-500 fill-pink-500 md:w-24 md:h-24 animate-pulse" 
            strokeWidth={1}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold leading-tight mb-6 px-4">
            <span className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent">
              Happy Valentine's Day
            </span>
            <br />
            <span className="text-rose-900 text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-4 block">
              My Beautiful Loveeeee ❤️
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-xl sm:text-2xl md:text-3xl text-rose-800 max-w-2xl mx-auto leading-relaxed px-4"
        >
          Today is all about celebrating you and everything you mean to me 💕
        </motion.p>
      </div>
    </section>
  );
});

// --- WHY I LOVE YOU SECTION ---
const WhyILoveYou = memo(() => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const reasons = [
    {
      icon: <Smile size={32} />,
      title: "Your Beautiful Smile",
      description: "The way your whole face lights up when you're truly happy - it's the most beautiful thing I've ever seen"
    },
    {
      icon: <Heart size={32} />,
      title: "Your Kind Heart",
      description: "You care so deeply about everyone around you. Your compassion makes the world a better place"
    },
    {
      icon: <Sparkles size={32} />,
      title: "Your Laugh",
      description: "That genuine, contagious laugh that makes me want to be funnier just to hear it more often"
    },
    {
      icon: <Star size={32} />,
      title: "How You Listen",
      description: "You don't just hear me - you really listen, understand, and remember the little things I say"
    },
    {
      icon: <Coffee size={32} />,
      title: "Your Authenticity",
      description: "You're unapologetically yourself, and that courage is something I deeply admire"
    },
    {
      icon: <Heart size={32} />,
      title: "You Choose Me",
      description: "Every day you choose to love me, and that's the greatest gift I could ever receive"
    }
  ];

  return (
    <section ref={ref} className="relative py-24 md:py-32 px-4">
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent mb-4 font-bold">
            Why I Love You
          </h2>
          <p className="text-lg md:text-xl text-rose-700">
            Just a few of the countless reasons...
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              className="group backdrop-blur-sm bg-white/90 border-2 border-pink-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 hover:border-pink-400 transition-all duration-300"
            >
              <div className="text-pink-500 mb-4 group-hover:scale-110 transition-transform">
                {reason.icon}
              </div>
              <h3 className="text-xl font-bold text-rose-900 mb-3">
                {reason.title}
              </h3>
              <p className="text-rose-700 leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// --- LOVE QUIZ SECTION ---
const LoveQuiz = memo(() => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleSelect = (index) => {
    if (selected !== null) return;
    setSelected(index);
    setShowResponse(true);
    if (index === quizQuestions[currentQ].correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setShowResponse(false);
    } else {
      setFinished(true);
      setShowResult(true);
      confetti({ 
        particleCount: 150, 
        spread: 80, 
        origin: { y: 0.6 }, 
        colors: ["#ec4899", "#f9a8d4", "#fb7185"] 
      });
    }
  };

  const getResultMessage = () => {
    const pct = score / quizQuestions.length;
    if (pct === 1) return { title: "Perfect Score! 💯", msg: "You know me better than I know myself! We're truly soulmates." };
    if (pct >= 0.6) return { title: "So Close! 💕", msg: "You know me so well! But there's always more to discover together." };
    return { title: "Let's Learn More! 💗", msg: "Every answer doesn't matter — what matters is that we're together!" };
  };

  const q = quizQuestions[currentQ];

  return (
    <section ref={ref} className="relative py-24 md:py-32 px-4 bg-gradient-to-b from-transparent via-pink-50/50 to-transparent">
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={isInView ? { opacity: 1, y: 0 } : {}} 
          transition={{ duration: 0.6 }} 
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent mb-4 font-bold">
            How Well Do You Know Us?
          </h2>
          <p className="text-lg md:text-xl text-rose-700">
            A little love quiz, just for fun 💝
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.div 
              key={`q-${currentQ}`} 
              initial={{ opacity: 0, x: 40 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -40 }} 
              transition={{ duration: 0.4 }} 
              className="backdrop-blur-sm bg-white/95 border-2 border-pink-200 rounded-3xl p-8 md:p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-rose-600 font-medium">
                  Question {currentQ + 1} of {quizQuestions.length}
                </span>
                <div className="flex gap-1.5">
                  {quizQuestions.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-2.5 rounded-full transition-all ${
                        i <= currentQ ? "bg-pink-500" : "bg-pink-200"
                      } ${i === currentQ ? "w-6" : "w-2.5"}`} 
                    />
                  ))}
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-rose-900 mb-8">
                {q.question}
              </h3>

              <div className="space-y-3">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={selected !== null}
                    className={`w-full text-left text-lg p-4 rounded-xl border-2 transition-all ${
                      selected === i
                        ? i === q.correctIndex
                          ? "border-green-400 bg-green-50"
                          : "border-red-300 bg-red-50"
                        : "border-pink-200 bg-white hover:border-pink-400 hover:bg-pink-50"
                    } ${selected !== null && i === q.correctIndex ? "border-green-400 bg-green-50" : ""} ${selected !== null ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm font-semibold text-pink-700">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-rose-900">{opt}</span>
                      {selected !== null && i === q.correctIndex && (
                        <Heart size={18} className="ml-auto text-pink-500 fill-pink-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {showResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="mt-6 p-4 rounded-xl bg-pink-50 border-2 border-pink-200 text-center"
                  >
                    <p className="text-lg text-rose-800 mb-4">{q.response}</p>
                    <button 
                      onClick={handleNext} 
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:shadow-lg transition-all"
                    >
                      {currentQ < quizQuestions.length - 1 ? "Next Question →" : "See Results ✨"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              key="result" 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.6, type: "spring" }} 
              className="text-center"
            >
              <div className="backdrop-blur-sm bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-12 shadow-2xl">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <PartyPopper size={64} className="mx-auto mb-6 text-white" />
                </motion.div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {getResultMessage().title}
                </h3>
                <p className="text-xl text-white/90 mb-4">
                  {score} out of {quizQuestions.length} correct!
                </p>
                <p className="text-lg text-white/80">
                  {getResultMessage().msg}
                </p>
              </div>
              <div className="flex justify-center gap-3 mt-8">
                <Sparkles className="text-pink-500" size={28} />
                <Heart className="text-rose-500 fill-rose-500" size={28} />
                <Sparkles className="text-pink-500" size={28} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
});

// --- MEMORY SLIDESHOW SECTION (FIXED HEIGHT, FULL IMAGE) ---
const MemorySlideshowSection = memo(() => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const slides = [
    { image: "/TBabe1.jpeg", caption: "Beautiful you 💕" },
    { image: "/TBabe2.jpeg", caption: "My sunshine ☀️" },
    { image: "/TBabe3.jpeg", caption: "Forever grateful 🌸" },
    { image: "/TBabe4.jpeg", caption: "Perfect moments ✨" },
    { image: "/TBabe5.jpeg", caption: "Perfect moments ✨" },
  ];

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section ref={sectionRef} className="relative py-16 md:py-40 px-4">
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl bg-gradient-to-r from-pink-500 via-pink-400 to-pink-600 bg-clip-text text-transparent mb-3 md:mb-4 font-bold px-4">
            Our Beautiful Memories
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative backdrop-blur-sm bg-white/95 border-2 border-pink-200 rounded-3xl p-4 md:p-8 shadow-2xl"
        >
          {/* Main slideshow container with STRICT fixed height */}
          <div className="relative">
            <div 
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 select-none"
              style={{ 
                height: '400px',
                minHeight: '400px',
                maxHeight: '400px'
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {/* Full image display - object-fit contain ensures full image shows */}
                  <img
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide].caption}
                    className="w-full h-full object-contain"
                    style={{ maxHeight: '400px' }}
                    loading="lazy"
                    draggable="false"
                  />
                  
                  {/* Caption overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6 md:p-8">
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-white text-xl md:text-3xl font-bold text-center drop-shadow-lg"
                    >
                      {slides[currentSlide].caption}
                    </motion.p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/95 backdrop-blur-sm border-2 border-pink-300 flex items-center justify-center text-rose-600 hover:bg-pink-50 hover:border-pink-400 hover:scale-110 active:scale-95 transition-all z-20 shadow-xl"
                aria-label="Previous image"
              >
                <ChevronLeft size={32} strokeWidth={3} />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/95 backdrop-blur-sm border-2 border-pink-300 flex items-center justify-center text-rose-600 hover:bg-pink-50 hover:border-pink-400 hover:scale-110 active:scale-95 transition-all z-20 shadow-xl"
                aria-label="Next image"
              >
                <ChevronRight size={32} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 md:gap-3 mt-6 md:mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'w-10 h-3 md:w-12 md:h-3.5 bg-gradient-to-r from-pink-500 to-rose-500'
                    : 'w-3 h-3 md:w-3.5 md:h-3.5 bg-pink-300 hover:bg-pink-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slide counter */}
          <div className="text-center mt-4 md:mt-6">
            <p className="text-rose-700 text-sm md:text-base font-medium">
              {currentSlide + 1} / {slides.length}
            </p>
          </div>
        </motion.div>

        {/* Swipe instruction for mobile */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-rose-600/70 text-xs md:text-sm mt-4 md:hidden"
        >
          👆 Swipe left or right to browse
        </motion.p>
      </div>
    </section>
  );
});

// --- VIDEOS SECTION ---
const VideosSection = memo(() => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const videoRefs = useRef([]);

  const videos = [
    { title: "Our First Date", videoUrl: "/TBabeVideo1.mp4" },
    { title: "Random Tuesday Giggles", videoUrl: "/TBabeVideo2.mp4" },
    { title: "Our First Walk Together", videoUrl: "/TBabeVideo3.mp4" },
    { title: "Our First Dance", videoUrl: "/TBabeVideo4.mp4" },
    { title: "Our First Movie Night", videoUrl: "/TBabeVideo5.mp4" },
    { title: "Making Breakfast Together", videoUrl: "/TBabeVideo6.mp4" },
    { title: "Sunset Stroll", videoUrl: "/TBabeVideo7.mp4" },
    { title: "Lazy Sunday Cuddles", videoUrl: "/TBabeVideo8.mp4" },
    { title: "Our Adventure", videoUrl: "/TBabeVideo9.mp4" },
    { title: "Just Us", videoUrl: "/TBabeVideo10.mp4" },
  ];

  // Videos will autoplay immediately due to autoPlay attribute on video element
  // No useEffect needed - the autoPlay attribute handles it

  return (
    <section ref={ref} className="relative py-24 md:py-32 px-4 bg-gradient-to-b from-transparent via-rose-50/50 to-transparent">
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent mb-4 font-bold">
            Relive Our Moments
          </h2>
          <p className="text-lg md:text-xl text-rose-700">
            Some memories are better in motion
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              className="group relative backdrop-blur-sm bg-white/90 border-2 border-pink-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative aspect-video">
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={video.videoUrl}
                  loop
                  muted
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover"
                  onClick={(e) => {
                    if (e.currentTarget.paused) {
                      e.currentTarget.play();
                    } else {
                      e.currentTarget.pause();
                    }
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// --- LOVE LETTER ---
const LoveLetter = memo(() => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const letterText = `My Beautiful Loveeeee,

I don't think words can truly capture everything you mean to me, but I want to try.

You are my favorite person, my best friend, my safe place. Every day with you is a gift - every laugh we share, every conversation, every quiet moment together.

I love you for so many reasons: your kindness, your strength, your beautiful soul. But more than anything, I love you for being authentically, unapologetically YOU.

You make me want to be better. You believe in me even when I don't believe in myself, and that faith pushes me to reach higher.

Thank you for choosing me. Thank you for being patient with me, for making me laugh, for being exactly who you are.

I promise to keep making you smile, to support your dreams, and to love you through every season. You are my today and all of my tomorrows.

Forever and always yours,
Thierry ❤️`;

  useEffect(() => {
    if (!isInView) return;

    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < letterText.length) {
        setDisplayedText(letterText.substring(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(typeInterval);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [isInView]);

  return (
    <section ref={ref} className="relative py-24 md:py-32 px-4">
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent mb-4 font-bold">
            A Letter to You
          </h2>
          <p className="text-lg md:text-xl text-rose-700">
            From my heart to yours
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative backdrop-blur-sm bg-white/95 border-2 border-pink-200 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <div className="absolute top-6 right-6 text-pink-400">
            <Quote size={40} className="opacity-20" />
          </div>
          
          <pre className="font-serif text-base md:text-lg text-rose-900 leading-relaxed whitespace-pre-wrap">
            {displayedText}
            {!isComplete && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-0.5 h-6 bg-pink-500 ml-1"
              />
            )}
          </pre>
        </motion.div>
      </div>
    </section>
  );
});

// --- 3D FLOWERS FOR YOU SECTION ---
const FlowersForYou = memo(() => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-200px" });
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const bouquetRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [loading, setLoading] = useState(true);
  
  // Interaction states
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);

  useEffect(() => {
    if (!containerRef.current || !isInView) return;

    console.log('🎨 Initializing Interactive Flowers 3D scene...');
    
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const width = containerRef.current.clientWidth;
    const isMobile = width < 768;
    const height = isMobile ? 500 : 700;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    scene.add(mainLight);
    
    const fillLight = new THREE.DirectionalLight(0xffc0cb, 1.5);
    fillLight.position.set(-5, 5, 5);
    scene.add(fillLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 1.2);
    backLight.position.set(0, 5, -10);
    scene.add(backLight);

    const loader = new GLTFLoader();
    
    // Load bouquet centered
    console.log('📦 Loading bouquet model...');
    loader.load(
      '/models/bouquet.glb',
      (gltf) => {
        console.log('✅ Bouquet loaded successfully!');
        const bouquet = gltf.scene;
        
        // Center the bouquet
        const bouquetScale = isMobile ? 5 : 8;
        bouquet.position.set(0, 0, 0);
        bouquet.scale.set(bouquetScale, bouquetScale, bouquetScale);
        
        bouquet.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.needsUpdate = true;
            }
          }
        });
        
        scene.add(bouquet);
        bouquetRef.current = bouquet;
        setLoading(false);
      },
      (progress) => {
        console.log(`Bouquet loading: ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
      },
      (error) => {
        console.error('❌ Error loading bouquet:', error);
        setLoading(false);
      }
    );

    // Mouse/Touch interaction handlers
    const handleMouseDown = (event) => {
      isDraggingRef.current = true;
      autoRotateRef.current = false;
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handleMouseMove = (event) => {
      if (!isDraggingRef.current || !bouquetRef.current) return;
      
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      
      const deltaX = clientX - previousMousePositionRef.current.x;
      const deltaY = clientY - previousMousePositionRef.current.y;
      
      rotationRef.current.y += deltaX * 0.01;
      rotationRef.current.x += deltaY * 0.01;
      
      // Limit vertical rotation
      rotationRef.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationRef.current.x));
      
      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (event) => {
      event.preventDefault();
      if (!cameraRef.current) return;
      
      const delta = event.deltaY * 0.01;
      cameraRef.current.position.z = Math.max(10, Math.min(30, cameraRef.current.position.z + delta));
    };

    // Add event listeners
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (bouquetRef.current) {
        if (autoRotateRef.current) {
          // Auto-rotate when not dragging
          bouquetRef.current.rotation.y += 0.005;
        } else {
          // Apply user rotation
          bouquetRef.current.rotation.y = rotationRef.current.y;
          bouquetRef.current.rotation.x = rotationRef.current.x;
        }
        
        // Gentle floating animation
        bouquetRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.3;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const isMobile = width < 768;
      const height = isMobile ? 500 : 700;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      
      if (bouquetRef.current) {
        const bouquetScale = isMobile ? 5 : 8;
        bouquetRef.current.scale.set(bouquetScale, bouquetScale, bouquetScale);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      console.log('🧹 Cleaning up 3D scene...');
      
      // Remove event listeners
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('touchstart', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (bouquetRef.current) scene.remove(bouquetRef.current);

      if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isInView]);

  return (
    <section ref={ref} className="relative py-24 md:py-32 px-4 bg-gradient-to-b from-transparent via-pink-50/50 to-transparent">
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent mb-4 font-bold">
            Flowers for You
          </h2>
          <p className="text-lg md:text-xl text-rose-700">
            A bouquet as beautiful as you 💐
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative backdrop-blur-sm bg-white/80 border-2 border-pink-200 rounded-3xl p-4 md:p-8 shadow-2xl overflow-hidden"
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10 rounded-3xl">
              <div className="text-center">
                <Loader2 className="animate-spin text-pink-500 mx-auto mb-4" size={48} />
                <p className="text-rose-700">Loading your bouquet...</p>
              </div>
            </div>
          )}
          
          <div 
            ref={containerRef} 
            className="w-full h-[500px] md:h-[700px] flex items-center justify-center rounded-2xl cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
          />
          
          <div className="mt-8 text-center">
            <p className="text-xl md:text-2xl text-rose-800 font-serif italic mb-4">
              "These flowers will never wilt, just like my love for you"
            </p>
            <p className="text-sm md:text-base text-rose-600 mb-6">
              🖱️ Drag to rotate • 🔍 Scroll to zoom
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <Heart className="text-pink-500 fill-pink-500" size={24} />
              <Sparkles className="text-rose-400" size={24} />
              <Heart className="text-pink-500 fill-pink-500" size={24} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

// --- FINAL REVEAL ---
const FinalReveal = memo(() => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ["#ec4899", "#f9a8d4", "#fb7185", "#fda4af"],
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <section ref={ref} className="relative py-32 md:py-40 px-4">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, type: "spring" }}
          className="space-y-8"
        >
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              <Heart 
                size={100}
                className="text-pink-500 fill-pink-500 md:w-32 md:h-32" 
                strokeWidth={1}
              />
            </motion.div>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent font-bold mb-6 px-4">
            Today is for YOU
          </h2>

          <div className="backdrop-blur-sm bg-white/90 border-2 border-pink-300 rounded-3xl p-8 md:p-12 shadow-2xl">
            <p className="text-2xl md:text-4xl text-rose-900 font-bold mb-6">
              I Love You
            </p>
            <p className="text-lg md:text-2xl text-rose-700 leading-relaxed">
              More than words can say, more than gestures can show.
              <br />
              You are my everything, today and always.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 pt-8"
          >
            <Sparkles className="text-pink-400" size={32} />
            <Heart className="text-rose-400 fill-rose-400" size={32} />
            <Sparkles className="text-pink-400" size={32} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
});

// --- MAIN APP ---
export default function App() {
  const [backgroundAudio, setBackgroundAudio] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-rose-50 font-serif relative overflow-x-hidden">
      
      <BackgroundMusic onAudioRef={setBackgroundAudio} />
      
      <ThreeDFlowerPetals />
      <FloatingHearts />
      <HeroSection />
      <WhyILoveYou />
      <LoveQuiz />
      <MemorySlideshowSection />
      <VideosSection />
      <LoveLetter />
      <FlowersForYou />
      <FinalReveal />
      
      <footer className="relative py-16 px-4 text-center border-t border-pink-200/50">
        <p className="text-rose-700 text-lg mb-2">
          Happy Valentine's Day, My Love 💕
        </p>
        <p className="text-sm text-rose-600">
          Forever Yours • Always & Forever
        </p>
      </footer>
    </div>
  );
}