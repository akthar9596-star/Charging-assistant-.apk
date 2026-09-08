import React, { useState, useEffect, useRef } from 'react';
import {
  Battery,
  BatteryCharging,
  Zap,
  Plug,
  Thermometer,
  Activity,
  History,
  Settings as SettingsIcon,
  Info,
  Shield,
  Volume2,
  Vibrate,
  Bell,
  Code2,
  Download,
  Terminal,
  ExternalLink,
  Check,
  Copy,
  Trash2,
  ArrowRight,
  Sun,
  Moon,
  Globe,
  RotateCcw,
  Smartphone,
  Play,
  Pause,
  AlertTriangle
} from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_FILES, ProjectFile } from './androidFiles';

// Audio Synthesizer for Alert Tone
function playAlertBeep(type: 'full' | 'temp' | 'low') {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'full') {
      // Upbeat cheerful chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'temp') {
      // Urgent warning pulse
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(700, audioCtx.currentTime);
      osc.frequency.setValueAtTime(500, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } else {
      // Low battery mellow warning
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn('Web Audio playback error:', e);
  }
}

function triggerVibration(pattern: number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

interface SimulatedSession {
  id: number;
  startTime: Date;
  endTime: Date;
  startPct: number;
  endPct: number;
  plugType: string;
  peakTemp: number;
}

export default function App() {
  // Main Navigation Modes
  const [activeMainTab, setActiveMainTab] = useState<'simulator' | 'files' | 'build_guide'>('simulator');

  // Simulator Screen Navigation
  const [currentPhoneTab, setCurrentPhoneTab] = useState<'dashboard' | 'battery_info' | 'history' | 'settings'>('dashboard');

  // App Settings State
  const [isBengali, setIsBengali] = useState(true);
  const [phoneThemeDark, setPhoneThemeDark] = useState(true);
  const [fullChargeAlertOn, setFullChargeAlertOn] = useState(true);
  const [fullChargeTarget, setFullChargeTarget] = useState(85);
  const [tempAlertOn, setTempAlertOn] = useState(true);
  const [maxTempLimit, setMaxTempLimit] = useState(42);
  const [lowBatteryAlertOn, setLowBatteryAlertOn] = useState(true);
  const [lowBatteryTarget, setLowBatteryTarget] = useState(20);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [persistentNotifOn, setPersistentNotifOn] = useState(true);

  // Simulated Hardware State
  const [batteryPct, setBatteryPct] = useState(78);
  const [plugType, setPlugType] = useState<'NONE' | 'AC' | 'USB' | 'WIRELESS'>('AC');
  const [temperature, setTemperature] = useState(33.4);
  const [voltage] = useState(4.18);
  const [isSimulatingCharging, setIsSimulatingCharging] = useState(false);

  // Notification Toast simulation
  const [activeToast, setActiveToast] = useState<{ title: string; message: string; type: 'full' | 'temp' | 'low' } | null>(null);

  // History sessions
  const [sessions, setSessions] = useState<SimulatedSession[]>([
    {
      id: 1,
      startTime: new Date(Date.now() - 3600000 * 4),
      endTime: new Date(Date.now() - 3600000 * 3),
      startPct: 22,
      endPct: 85,
      plugType: 'AC Fast Charger',
      peakTemp: 38.2
    },
    {
      id: 2,
      startTime: new Date(Date.now() - 3600000 * 24),
      endTime: new Date(Date.now() - 3600000 * 23),
      startPct: 15,
      endPct: 80,
      plugType: 'Wireless Charger',
      peakTemp: 41.0
    }
  ]);

  // Active charging session tracker
  const activeSessionRef = useRef<{ startTime: Date; startPct: number; peakTemp: number; plugType: string } | null>({
    startTime: new Date(Date.now() - 1200000),
    startPct: 45,
    peakTemp: 34.0,
    plugType: 'AC Fast Charger'
  });

  // Code Viewer State
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(ANDROID_FILES[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Auto charging simulator tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSimulatingCharging && plugType !== 'NONE') {
      interval = setInterval(() => {
        setBatteryPct((prev) => {
          if (prev >= 100) return 100;
          return prev + 1;
        });
        setTemperature((prev) => {
          if (prev < 44) return +(prev + 0.2).toFixed(1);
          return prev;
        });
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulatingCharging, plugType]);

  // Check alert thresholds
  useEffect(() => {
    // 1. Full charge alert
    if (plugType !== 'NONE' && fullChargeAlertOn && batteryPct >= fullChargeTarget) {
      triggerNotification(
        isBengali ? 'চার্জিং সীমা পূর্ণ হয়েছে!' : 'Battery Charge Limit Reached!',
        isBengali
          ? `আপনার ফোনের চার্জ নির্ধারিত ${fullChargeTarget}% এ পৌঁছেছে। চার্জার খুলে ফেলুন।`
          : `Battery reached ${fullChargeTarget}%. Disconnect charger to prolong lifespan.`,
        'full'
      );
    }

    // 2. Temp alert
    if (tempAlertOn && temperature >= maxTempLimit) {
      triggerNotification(
        isBengali ? 'ব্যাটারি অতিরিক্ত গরম সতর্কতা!' : 'Battery Overheat Warning!',
        isBengali
          ? `তাপমাত্রা ${temperature}°C হয়েছে! ফোনটিকে ঠাণ্ডা হতে দিন।`
          : `Temperature is ${temperature}°C! Please let device cool down.`,
        'temp'
      );
    }

    // 3. Low battery alert
    if (plugType === 'NONE' && lowBatteryAlertOn && batteryPct <= lowBatteryTarget) {
      triggerNotification(
        isBengali ? 'লো ব্যাটারি সতর্কতা!' : 'Low Battery Alert!',
        isBengali
          ? `ব্যাটারি কমে ${batteryPct}% হয়েছে। চার্জে সংযুক্ত করুন।`
          : `Battery dropped to ${batteryPct}%. Please plug in charger.`,
        'low'
      );
    }
  }, [batteryPct, temperature, plugType, fullChargeTarget, maxTempLimit, lowBatteryTarget, isBengali]);

  const triggerNotification = (title: string, message: string, type: 'full' | 'temp' | 'low') => {
    setActiveToast({ title, message, type });
    if (soundEnabled) playAlertBeep(type);
    if (vibrationEnabled) triggerVibration([300, 150, 300]);
    setTimeout(() => {
      setActiveToast((curr) => (curr?.title === title ? null : curr));
    }, 5000);
  };

  // Handle plug change and record history
  const handlePlugChange = (newPlug: 'NONE' | 'AC' | 'USB' | 'WIRELESS') => {
    if (newPlug === 'NONE' && plugType !== 'NONE') {
      // Finished a session
      if (activeSessionRef.current) {
        const finished: SimulatedSession = {
          id: Date.now(),
          startTime: activeSessionRef.current.startTime,
          endTime: new Date(),
          startPct: activeSessionRef.current.startPct,
          endPct: batteryPct,
          plugType: activeSessionRef.current.plugType,
          peakTemp: Math.max(activeSessionRef.current.peakTemp, temperature)
        };
        setSessions((prev) => [finished, ...prev]);
        activeSessionRef.current = null;
      }
      setIsSimulatingCharging(false);
    } else if (newPlug !== 'NONE' && plugType === 'NONE') {
      // Started a session
      activeSessionRef.current = {
        startTime: new Date(),
        startPct: batteryPct,
        peakTemp: temperature,
        plugType: newPlug === 'AC' ? 'AC Fast Charger' : newPlug === 'USB' ? 'USB Port' : 'Wireless Charger'
      };
    }
    setPlugType(newPlug);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Download entire Android Studio Project as a ZIP
  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const root = zip.folder('ChargingAssistant');

      // Add all project files into the zip archive
      ANDROID_FILES.forEach((file) => {
        root?.file(file.path, file.content);
      });

      // Add additional gradle files
      root?.file('gradle.properties', `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nandroid.enableJetifier=false\n`);
      root?.file('gradle/wrapper/gradle-wrapper.properties', `distributionBase=GRADLE_USER_HOME\ndistributionPath=wrapper/dists\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip\nnetworkTimeout=10000\nvalidateDistributionUrl=true\nzipStoreBase=GRADLE_USER_HOME\nzipStorePath=wrapper/dists\n`);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ChargingAssistant-AndroidStudio-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating project ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const isCharging = plugType !== 'NONE';

  return (
    <div id="app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',_'Hind_Siliguri',_sans-serif]">
      {/* Top Header */}
      <header id="main-header" className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold text-xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  {isBengali ? 'চার্জিং সহকারী' : 'Charging Assistant'}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                  Android APK v1.0.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isBengali ? 'স্মার্ট ব্যাটারি সুরক্ষা ও চার্জিং নোটিফিকেশন অ্যাপ' : 'Smart Battery Safety & Charging Notification App'}
              </p>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center gap-2 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              id="tab-simulator"
              onClick={() => setActiveMainTab('simulator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMainTab === 'simulator'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{isBengali ? 'অ্যাপ সিমুলেটর' : 'Phone Simulator'}</span>
            </button>
            <button
              id="tab-files"
              onClick={() => setActiveMainTab('files')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMainTab === 'files'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>{isBengali ? 'অ্যান্ড্রয়েড সোর্স কোড' : 'Android Source'}</span>
            </button>
            <button
              id="tab-build-guide"
              onClick={() => setActiveMainTab('build_guide')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMainTab === 'build_guide'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>{isBengali ? 'এপিকে বিল্ড গাইড' : 'Build & Release'}</span>
            </button>
          </div>

          {/* Download APK Project Button */}
          <button
            id="download-project-zip-btn"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? (isBengali ? 'জিপ তৈরি হচ্ছে...' : 'Zipping...') : (isBengali ? 'অ্যান্ড্রয়েড প্রজেক্ট ডাউনলোড (.ZIP)' : 'Download Android Studio ZIP')}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        {activeMainTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Hardware Simulation Control Dock */}
            <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h2 className="font-bold text-sm text-white">
                    {isBengali ? 'হার্ডওয়্যার সিমুলেটর ডক' : 'Hardware Simulator Controls'}
                  </h2>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  Android BatteryManager
                </span>
              </div>

              {/* Power Source Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  {isBengali ? 'চার্জার সংযোগ ও সোর্স নির্বাচন' : 'Charger Connection & Source'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-plug-none"
                    onClick={() => handlePlugChange('NONE')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      plugType === 'NONE'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Plug className="w-3.5 h-3.5" />
                    <span>{isBengali ? 'চার্জার বিচ্ছিন্ন' : 'Unplugged'}</span>
                  </button>
                  <button
                    id="btn-plug-ac"
                    onClick={() => handlePlugChange('AC')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      plugType === 'AC'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isBengali ? 'এসি ফাস্ট চার্জার' : 'AC Charger'}</span>
                  </button>
                  <button
                    id="btn-plug-usb"
                    onClick={() => handlePlugChange('USB')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      plugType === 'USB'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Plug className="w-3.5 h-3.5" />
                    <span>{isBengali ? 'ইউএসবি পোর্ট' : 'USB Port'}</span>
                  </button>
                  <button
                    id="btn-plug-wireless"
                    onClick={() => handlePlugChange('WIRELESS')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      plugType === 'WIRELESS'
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <BatteryCharging className="w-3.5 h-3.5" />
                    <span>{isBengali ? 'ওয়্যারলেস চার্জ' : 'Wireless'}</span>
                  </button>
                </div>
              </div>

              {/* Battery Level Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    {isBengali ? 'ব্যাটারি শতকরা মাত্রা' : 'Battery Percentage'}
                  </label>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{batteryPct}%</span>
                </div>
                <input
                  id="slider-battery-pct"
                  type="range"
                  min="5"
                  max="100"
                  value={batteryPct}
                  onChange={(e) => setBatteryPct(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>5% (Low)</span>
                  <span>50%</span>
                  <span>85% (Target)</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Temperature Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isBengali ? 'ব্যাটারি তাপমাত্রা' : 'Battery Temperature'}</span>
                  </label>
                  <span
                    className={`text-sm font-bold font-mono ${
                      temperature >= maxTempLimit ? 'text-rose-400' : 'text-cyan-400'
                    }`}
                  >
                    {temperature}°C
                  </span>
                </div>
                <input
                  id="slider-temperature"
                  type="range"
                  min="25"
                  max="48"
                  step="0.5"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>25°C (Cool)</span>
                  <span>35°C (Normal)</span>
                  <span className="text-rose-400 font-semibold">{maxTempLimit}°C+ (Overheat)</span>
                </div>
              </div>

              {/* Auto Charging Simulation Toggle */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {isSimulatingCharging ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{isBengali ? 'স্বয়ংক্রিয় চার্জিং সিমুলেশন' : 'Live Auto-Charge Loop'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isBengali ? 'চার্জার সংযুক্ত থাকলে প্রতি ১.৫ সেকেন্ডে +১% চার্জ বাড়বে' : 'Increments 1% every 1.5s while plugged in'}
                  </p>
                </div>
                <button
                  id="btn-toggle-auto-charge"
                  onClick={() => {
                    if (plugType === 'NONE') handlePlugChange('AC');
                    setIsSimulatingCharging(!isSimulatingCharging);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSimulatingCharging
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isSimulatingCharging ? (isBengali ? 'থামান' : 'Stop') : (isBengali ? 'চালু করুন' : 'Start')}
                </button>
              </div>

              {/* Quick Alert Testers */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  {isBengali ? 'অ্যালার্ট অডিও ও ভাইব্রেশন টেস্ট' : 'Test Alert Feedback (Audio & Vibration)'}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setBatteryPct(fullChargeTarget);
                      triggerNotification(
                        isBengali ? 'ফুল চার্জ অ্যালার্ট!' : 'Full Charge Alert!',
                        isBengali ? `${fullChargeTarget}% চার্জ সম্পূর্ণ হয়েছে!` : `Target ${fullChargeTarget}% reached!`,
                        'full'
                      );
                    }}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-emerald-300 text-center transition-all"
                  >
                    {isBengali ? 'ফুল চার্জ টেস্ট' : 'Full Charge'}
                  </button>
                  <button
                    onClick={() => {
                      setTemperature(44.0);
                      triggerNotification(
                        isBengali ? 'উচ্চ তাপমাত্রা অ্যালার্ট!' : 'Overheat Alert!',
                        isBengali ? 'ব্যাটারি তাপমাত্রা ৪৪°C অতিক্রম করেছে!' : 'Temperature exceeded 44°C!',
                        'temp'
                      );
                    }}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-amber-300 text-center transition-all"
                  >
                    {isBengali ? 'ওভারহিট টেস্ট' : 'Overheat'}
                  </button>
                  <button
                    onClick={() => {
                      setPlugType('NONE');
                      setBatteryPct(lowBatteryTarget);
                      triggerNotification(
                        isBengali ? 'লো ব্যাটারি অ্যালার্ট!' : 'Low Battery Alert!',
                        isBengali ? `চার্জ কমে ${lowBatteryTarget}% হয়েছে!` : `Battery dropped to ${lowBatteryTarget}%!`,
                        'low'
                      );
                    }}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-rose-300 text-center transition-all"
                  >
                    {isBengali ? 'লো ব্যাটারি' : 'Low Battery'}
                  </button>
                </div>
              </div>
            </div>

            {/* Center: Android Phone Mockup */}
            <div className="lg:col-span-8 flex justify-center">
              <div
                id="android-phone-frame"
                className="w-full max-w-[400px] rounded-[44px] p-3 bg-slate-900 border-[6px] border-slate-700/80 shadow-2xl relative overflow-hidden transition-all"
                style={{
                  boxShadow: isCharging
                    ? '0 25px 60px -15px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.2)'
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                }}
              >
                {/* Phone Speaker & Camera Notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-40 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800 mr-2" />
                  <div className="w-8 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Inner Screen Container */}
                <div
                  className={`w-full min-h-[640px] rounded-[36px] overflow-hidden flex flex-col transition-colors duration-300 relative ${
                    phoneThemeDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
                  }`}
                >
                  {/* Android Status Bar */}
                  <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-medium opacity-80 z-30 select-none">
                    <span>09:41</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]">{batteryPct}%</span>
                      {isCharging ? (
                        <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      ) : (
                        <Battery className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>

                  {/* Push Notification Toast Simulator */}
                  {activeToast && (
                    <div
                      id="simulated-notification-toast"
                      className="mx-3 mt-1 p-3 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-xl text-white z-50 animate-bounce duration-300 flex items-start gap-2.5"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                            {isBengali ? 'চার্জিং সহকারী' : 'Charging Assistant'}
                          </span>
                          <span className="text-[9px] text-slate-400">এখন</span>
                        </div>
                        <h4 className="text-xs font-bold mt-0.5">{activeToast.title}</h4>
                        <p className="text-[11px] text-slate-300 leading-tight mt-0.5">{activeToast.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Foreground Persistent Notification in Status Bar / Drawer if turned on */}
                  {persistentNotifOn && isCharging && (
                    <div className="mx-3 my-1 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span>
                          {isBengali ? 'চার্জিং সহকারী সক্রিয়:' : 'Charging:'} {batteryPct}% • {temperature}°C
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {plugType === 'AC' ? (isBengali ? 'এসি' : 'AC') : plugType === 'USB' ? 'USB' : 'Wireless'}
                      </span>
                    </div>
                  )}

                  {/* Phone Screen Viewport Content */}
                  <div className="flex-1 p-4 overflow-y-auto max-h-[510px]">
                    {/* 1. DASHBOARD TAB */}
                    {currentPhoneTab === 'dashboard' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-xl font-bold tracking-tight">
                              {isBengali ? 'চার্জিং সহকারী' : 'Charging Assistant'}
                            </h2>
                            <p className="text-xs opacity-60">
                              {isBengali ? 'স্মার্ট ব্যাটারি সুরক্ষা ও মনিটর' : 'Battery & Charge Monitor'}
                            </p>
                          </div>
                          {isCharging && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {plugType === 'AC'
                                ? isBengali ? 'এসি ফাস্ট চার্জ' : 'AC Fast Charge'
                                : plugType === 'USB'
                                ? 'USB Port'
                                : isBengali ? 'ওয়্যারলেস' : 'Wireless'}
                            </span>
                          )}
                        </div>

                        {/* Circular Battery Progress Gauge */}
                        <div className="flex flex-col items-center justify-center py-4">
                          <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* SVG Gauge */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              {/* Background track */}
                              <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-slate-800"
                              />
                              {/* Animated Progress Arc */}
                              <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="transparent"
                                stroke={
                                  isCharging
                                    ? '#10b981'
                                    : batteryPct <= 15
                                    ? '#ef4444'
                                    : batteryPct <= 25
                                    ? '#f59e0b'
                                    : '#10b981'
                                }
                                strokeWidth="8"
                                strokeDasharray={264}
                                strokeDashoffset={264 - (264 * batteryPct) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-700 ease-out"
                              />
                            </svg>

                            {/* Center Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                              <div className="flex items-center justify-center">
                                {isCharging && (
                                  <Zap className="w-6 h-6 text-emerald-400 animate-pulse fill-emerald-400 -mr-1" />
                                )}
                                <span className="text-4xl font-extrabold tracking-tighter">
                                  {batteryPct}%
                                </span>
                              </div>
                              <span
                                className={`text-xs font-semibold mt-0.5 ${
                                  isCharging ? 'text-emerald-400' : 'opacity-70'
                                }`}
                              >
                                {isCharging
                                  ? batteryPct >= 100
                                    ? isBengali ? 'সম্পূর্ণ চার্জ হয়েছে' : 'Fully Charged'
                                    : isBengali ? 'চার্জ হচ্ছে' : 'Charging'
                                  : isBengali ? 'চার্জ হচ্ছে না' : 'Not Charging'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Active Alerts Banner */}
                        {(fullChargeAlertOn || tempAlertOn) && (
                          <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                            phoneThemeDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-emerald-400" />
                              <span className="opacity-90">
                                {isBengali ? 'অ্যালার্ট সীমা:' : 'Alert Limits:'}{' '}
                                <strong className="text-emerald-400">{fullChargeTarget}%</strong> •{' '}
                                <strong className="text-amber-400">{maxTempLimit}°C</strong>
                              </span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                              {isBengali ? 'সক্রিয়' : 'Active'}
                            </span>
                          </div>
                        )}

                        {/* 2x2 Telemetry Cards */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-3 rounded-2xl border ${
                            phoneThemeDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            <div className="flex items-center gap-1.5 opacity-70 mb-1">
                              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="text-[11px]">{isBengali ? 'তাপমাত্রা' : 'Temperature'}</span>
                            </div>
                            <div className={`text-base font-bold ${
                              temperature >= maxTempLimit ? 'text-rose-400' : 'text-cyan-400'
                            }`}>
                              {temperature} °C
                            </div>
                          </div>

                          <div className={`p-3 rounded-2xl border ${
                            phoneThemeDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            <div className="flex items-center gap-1.5 opacity-70 mb-1">
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-[11px]">{isBengali ? 'ভোল্টেজ' : 'Voltage'}</span>
                            </div>
                            <div className="text-base font-bold text-amber-400">{voltage} V</div>
                          </div>

                          <div className={`p-3 rounded-2xl border ${
                            phoneThemeDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            <div className="flex items-center gap-1.5 opacity-70 mb-1">
                              <Activity className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px]">{isBengali ? 'স্বাস্থ্য' : 'Health'}</span>
                            </div>
                            <div className="text-base font-bold text-emerald-400">
                              {temperature >= maxTempLimit
                                ? (isBengali ? 'গরম' : 'Overheat')
                                : (isBengali ? 'ভালো (Good)' : 'Good')}
                            </div>
                          </div>

                          <div className={`p-3 rounded-2xl border ${
                            phoneThemeDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            <div className="flex items-center gap-1.5 opacity-70 mb-1">
                              <Plug className="w-3.5 h-3.5 text-teal-400" />
                              <span className="text-[11px]">{isBengali ? 'কারেন্ট' : 'Current'}</span>
                            </div>
                            <div className="text-base font-bold text-teal-400">
                              {isCharging ? '+1850 mA' : '-240 mA'}
                            </div>
                          </div>
                        </div>

                        {/* Safety Disclaimer */}
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                          <p className="leading-snug">
                            {isBengali
                              ? 'অ্যান্ড্রয়েড সিস্টেম সরাসরি বৈদ্যুতিক চার্জিং বিচ্ছিন্ন করতে পারে না। কাঙ্ক্ষিত চার্জ স্তর পৌঁছালে চার্জার খুলতে নোটিফিকেশন দেওয়া হয়।'
                              : 'Android apps cannot physically stop incoming current. This app notifies you with chime and vibration to disconnect.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 2. BATTERY INFO TAB */}
                    {currentPhoneTab === 'battery_info' && (
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-xl font-bold tracking-tight">
                            {isBengali ? 'ব্যাটারি তথ্য' : 'Battery Info'}
                          </h2>
                          <p className="text-xs opacity-60">
                            {isBengali ? 'অ্যান্ড্রয়েড ব্যাটারি ম্যানেজার হার্ডওয়্যার টেলিমেট্রি' : 'Hardware Telemetry & BatteryManager Diagnostics'}
                          </p>
                        </div>

                        <div className={`rounded-2xl border divide-y ${
                          phoneThemeDark
                            ? 'bg-slate-900/90 border-slate-800 divide-slate-800'
                            : 'bg-white border-slate-200 divide-slate-100 shadow-sm'
                        }`}>
                          <div className="p-3 flex justify-between items-center text-xs">
                            <span className="opacity-70">{isBengali ? 'ব্যাটারি চার্জ' : 'Battery Level'}</span>
                            <span className="font-bold text-emerald-400">{batteryPct}%</span>
                          </div>
                          <div className="p-3 flex justify-between items-center text-xs">
                            <span className="opacity-70">{isBengali ? 'চার্জিং স্থিতি' : 'Charging Status'}</span>
                            <span className="font-semibold">
                              {isCharging
                                ? isBengali ? 'চার্জ হচ্ছে' : 'Charging'
                                : isBengali ? 'চার্জ হচ্ছে না' : 'Not Charging'}
                            </span>
                          </div>
                          <div className="p-3 flex justify-between items-center text-xs">
                            <span className="opacity-70">{isBengali ? 'পাওয়ার সোর্স' : 'Power Source'}</span>
                            <span className="font-semibold">
                              {plugType === 'AC'
                                ? isBengali ? 'এসি ফাস্ট চার্জার' : 'AC Fast Charger'
                                : plugType === 'USB'
                                ? 'USB Port'
                                : plugType === 'WIRELESS'
                                ? isBengali ? 'ওয়্যারলেস চার্জার' : 'Wireless'
                                : isBengali ? 'ব্যাটারি পাওয়ার' : 'Battery Power'}
                            </span>
                          </div>
                          <div className="p-3 flex justify-between items-center text-xs">
                            <span className="opacity-70">{isBengali ? 'ব্যাটারি স্বাস্থ্য' : 'Battery Health'}</span>
                            <span className="font-semibold text-emerald-400">
                              {isBengali ? 'ভালো (Good Condition)' : 'Good Condition'}
                            </span>
                          </div>
                          <div className="p-3 flex justify-between items-center text-xs">
                            <span className="opacity-70">{isBengali ? 'ব্যাটারি তাপমাত্রা' : 'Temperature'}</span>
                            <span className="font-semibold">{temperature} °C</span>
                          </div>
                          <div className="p-3 flex justify-between items-center text-xs">
                            <span className="opacity-70">{isBengali ? 'ভোল্টেজ' : 'Voltage'}</span>
                            <span className="font-semibold">{voltage} V</span>
                          </div>
                          <div className="p-3 flex justify-between items-center text-xs">
                            <span className="opacity-70">{isBengali ? 'প্রযুক্তি (Technology)' : 'Technology'}</span>
                            <span className="font-semibold">Li-ion (Lithium-ion)</span>
                          </div>
                          <div className="p-3 flex justify-between items-center text-xs">
                            <span className="opacity-70">{isBengali ? 'ধারণক্ষমতা' : 'Design Capacity'}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              {isBengali ? 'এই ডিভাইসে উপলব্ধ নয়' : 'Not available on this device'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. CHARGING HISTORY TAB */}
                    {currentPhoneTab === 'history' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-xl font-bold tracking-tight">
                              {isBengali ? 'চার্জিং ইতিহাস' : 'Charging History'}
                            </h2>
                            <p className="text-xs opacity-60">
                              {sessions.length} {isBengali ? 'টি সংরক্ষিত সেশন' : 'logged sessions'}
                            </p>
                          </div>
                          {sessions.length > 0 && (
                            <button
                              onClick={() => setSessions([])}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs flex items-center gap-1 font-medium transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isBengali ? 'মুছুন' : 'Clear'}</span>
                            </button>
                          )}
                        </div>

                        {sessions.length === 0 ? (
                          <div className="text-center py-12 px-4 opacity-60 space-y-2">
                            <History className="w-10 h-10 mx-auto opacity-40" />
                            <p className="text-xs">
                              {isBengali
                                ? 'কোনো চার্জিং ইতিহাস নেই। ফোন চার্জে লাগালেই রেকর্ড হবে।'
                                : 'No charging sessions recorded yet. Plug in charger to log.'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {sessions.map((sess) => {
                              const durationMin = Math.max(1, Math.round((sess.endTime.getTime() - sess.startTime.getTime()) / 60000));
                              return (
                                <div
                                  key={sess.id}
                                  className={`p-3 rounded-2xl border ${
                                    phoneThemeDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <BatteryCharging className="w-4 h-4 text-emerald-400" />
                                      <span className="text-xs font-bold">
                                        {sess.startPct}% <ArrowRight className="w-3 h-3 inline text-slate-500" /> {sess.endPct}%
                                      </span>
                                    </div>
                                    <span className="text-xs font-extrabold text-emerald-400 font-mono">
                                      +{sess.endPct - sess.startPct}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-[11px] opacity-70">
                                    <span>{sess.plugType} • {durationMin} {isBengali ? 'মিনিট' : 'min'}</span>
                                    <span>Peak: {sess.peakTemp}°C</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. SETTINGS TAB */}
                    {currentPhoneTab === 'settings' && (
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-xl font-bold tracking-tight">
                            {isBengali ? 'সেটিংস' : 'Settings'}
                          </h2>
                          <p className="text-xs opacity-60">
                            {isBengali ? 'অ্যালার্ট, শব্দ, ভাইব্রেশন ও ভাষা' : 'Alert thresholds, audio, and language'}
                          </p>
                        </div>

                        {/* Full Charge Alert Setting */}
                        <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                          phoneThemeDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                                <span>{isBengali ? 'ফুল চার্জ অ্যালার্ট' : 'Full Charge Alert'}</span>
                              </h3>
                              <p className="text-[11px] opacity-60">
                                {isBengali ? 'কাঙ্ক্ষিত স্তরে পৌঁছালে অ্যালার্ট দিন' : 'Notify when battery charges up to target'}
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={fullChargeAlertOn}
                              onChange={(e) => setFullChargeAlertOn(e.target.checked)}
                              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                            />
                          </div>

                          {fullChargeAlertOn && (
                            <div className="pt-2 border-t border-slate-800">
                              <span className="text-[11px] opacity-80 block mb-1.5">
                                {isBengali ? 'কাঙ্ক্ষিত শতকরা সীমা:' : 'Target Charge Percentage:'}
                              </span>
                              <div className="flex gap-1.5 flex-wrap">
                                {[80, 85, 90, 95, 100].map((val) => (
                                  <button
                                    key={val}
                                    onClick={() => setFullChargeTarget(val)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                      fullChargeTarget === val
                                        ? 'bg-emerald-500 text-slate-950 font-bold'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                                  >
                                    {val}%
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Temperature Alert Setting */}
                        <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                          phoneThemeDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                <Thermometer className="w-4 h-4 text-amber-400" />
                                <span>{isBengali ? 'উচ্চ তাপমাত্রা সতর্কতা' : 'High Temperature Alert'}</span>
                              </h3>
                              <p className="text-[11px] opacity-60">
                                {isBengali ? 'নির্ধারিত তাপমাত্রার উপরে উঠলে সতর্ক করুন' : 'Warn if battery temperature exceeds limit'}
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={tempAlertOn}
                              onChange={(e) => setTempAlertOn(e.target.checked)}
                              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                            />
                          </div>

                          {tempAlertOn && (
                            <div className="pt-2 border-t border-slate-800">
                              <div className="flex justify-between text-[11px] opacity-80 mb-1">
                                <span>{isBengali ? 'সর্বোচ্চ সীমা:' : 'Max Limit:'}</span>
                                <span className="font-bold text-amber-400">{maxTempLimit}°C</span>
                              </div>
                              <input
                                type="range"
                                min="38"
                                max="48"
                                value={maxTempLimit}
                                onChange={(e) => setMaxTempLimit(Number(e.target.value))}
                                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                              />
                            </div>
                          )}
                        </div>

                        {/* Low Battery Alert Setting */}
                        <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                          phoneThemeDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                <Battery className="w-4 h-4 text-rose-400" />
                                <span>{isBengali ? 'লো ব্যাটারি অ্যালার্ট' : 'Low Battery Alert'}</span>
                              </h3>
                              <p className="text-[11px] opacity-60">
                                {isBengali ? 'চার্জ নির্দিষ্ট সীমার নিচে নামলে সতর্কবার্তা' : 'Alert when battery drops below safety level'}
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={lowBatteryAlertOn}
                              onChange={(e) => setLowBatteryAlertOn(e.target.checked)}
                              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                            />
                          </div>

                          {lowBatteryAlertOn && (
                            <div className="pt-2 border-t border-slate-800">
                              <span className="text-[11px] opacity-80 block mb-1.5">
                                {isBengali ? 'লো ব্যাটারি লেভেল:' : 'Low Battery Threshold:'}
                              </span>
                              <div className="flex gap-1.5">
                                {[10, 15, 20, 25].map((val) => (
                                  <button
                                    key={val}
                                    onClick={() => setLowBatteryTarget(val)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                      lowBatteryTarget === val
                                        ? 'bg-rose-500 text-white font-bold'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                                  >
                                    {val}%
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Feedback & Language Toggles */}
                        <div className={`p-3 rounded-2xl border divide-y ${
                          phoneThemeDark
                            ? 'bg-slate-900/90 border-slate-800 divide-slate-800'
                            : 'bg-white border-slate-200 divide-slate-100 shadow-sm'
                        }`}>
                          <div className="p-2 flex justify-between items-center text-xs">
                            <span className="flex items-center gap-2">
                              <Volume2 className="w-4 h-4 text-emerald-400" />
                              {isBengali ? 'শব্দ / সাউন্ড অ্যালার্ট' : 'Sound Alert'}
                            </span>
                            <input
                              type="checkbox"
                              checked={soundEnabled}
                              onChange={(e) => setSoundEnabled(e.target.checked)}
                              className="accent-emerald-500 cursor-pointer"
                            />
                          </div>
                          <div className="p-2 flex justify-between items-center text-xs">
                            <span className="flex items-center gap-2">
                              <Vibrate className="w-4 h-4 text-emerald-400" />
                              {isBengali ? 'ভাইব্রেশন' : 'Vibration'}
                            </span>
                            <input
                              type="checkbox"
                              checked={vibrationEnabled}
                              onChange={(e) => setVibrationEnabled(e.target.checked)}
                              className="accent-emerald-500 cursor-pointer"
                            />
                          </div>
                          <div className="p-2 flex justify-between items-center text-xs">
                            <span className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-emerald-400" />
                              {isBengali ? 'চলমান চার্জিং নোটিফিকেশন' : 'Persistent Charging Notification'}
                            </span>
                            <input
                              type="checkbox"
                              checked={persistentNotifOn}
                              onChange={(e) => setPersistentNotifOn(e.target.checked)}
                              className="accent-emerald-500 cursor-pointer"
                            />
                          </div>
                          <div className="p-2 flex justify-between items-center text-xs">
                            <span className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-emerald-400" />
                              {isBengali ? 'অ্যাপের ভাষা' : 'App Language'}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setIsBengali(true)}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  isBengali ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                বাংলা
                              </button>
                              <button
                                onClick={() => setIsBengali(false)}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  !isBengali ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                English
                              </button>
                            </div>
                          </div>
                          <div className="p-2 flex justify-between items-center text-xs">
                            <span className="flex items-center gap-2">
                              {phoneThemeDark ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                              {isBengali ? 'থিম' : 'Theme'}
                            </span>
                            <button
                              onClick={() => setPhoneThemeDark(!phoneThemeDark)}
                              className="px-2.5 py-1 rounded bg-slate-800 text-[11px] font-semibold text-slate-200"
                            >
                              {phoneThemeDark ? (isBengali ? 'ডার্ক মোড' : 'Dark') : (isBengali ? 'লাইট মোড' : 'Light')}
                            </button>
                          </div>
                        </div>

                        {/* Privacy Statement */}
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 text-[11px] opacity-70">
                          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            {isBengali
                              ? '১০০% অফলাইন এবং সুরক্ষিত। কোনো ব্যক্তিগত ডেটা সার্ভারে পাঠানো হয় না।'
                              : '100% Offline & Private. Never collects or uploads battery data.'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Android Bottom Navigation Bar */}
                  <div
                    id="phone-bottom-nav"
                    className={`border-t px-2 py-1.5 flex justify-around items-center z-30 ${
                      phoneThemeDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200'
                    }`}
                  >
                    <button
                      id="nav-btn-dashboard"
                      onClick={() => setCurrentPhoneTab('dashboard')}
                      className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                        currentPhoneTab === 'dashboard'
                          ? 'text-emerald-400 font-bold'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <BatteryCharging className="w-5 h-5" />
                      <span className="text-[10px]">{isBengali ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                    </button>

                    <button
                      id="nav-btn-battery-info"
                      onClick={() => setCurrentPhoneTab('battery_info')}
                      className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                        currentPhoneTab === 'battery_info'
                          ? 'text-emerald-400 font-bold'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <Info className="w-5 h-5" />
                      <span className="text-[10px]">{isBengali ? 'তথ্য' : 'Battery Info'}</span>
                    </button>

                    <button
                      id="nav-btn-history"
                      onClick={() => setCurrentPhoneTab('history')}
                      className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                        currentPhoneTab === 'history'
                          ? 'text-emerald-400 font-bold'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <History className="w-5 h-5" />
                      <span className="text-[10px]">{isBengali ? 'ইতিহাস' : 'History'}</span>
                    </button>

                    <button
                      id="nav-btn-settings"
                      onClick={() => setCurrentPhoneTab('settings')}
                      className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                        currentPhoneTab === 'settings'
                          ? 'text-emerald-400 font-bold'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <SettingsIcon className="w-5 h-5" />
                      <span className="text-[10px]">{isBengali ? 'সেটিংস' : 'Settings'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ANDROID SOURCE CODE BROWSER */}
        {activeMainTab === 'files' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px]">
            {/* File List Tree */}
            <div className="md:col-span-4 border-r border-slate-800 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Project Files ({ANDROID_FILES.length})</span>
                </div>
                <button
                  onClick={handleDownloadZip}
                  className="text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ZIP</span>
                </button>
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[520px] pr-1">
                {ANDROID_FILES.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                      selectedFile.path === file.path
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {file.language}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Code Display Area */}
            <div className="md:col-span-8 flex flex-col bg-slate-950">
              <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 font-semibold">{selectedFile.path}</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="flex-1 p-5 overflow-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[560px]">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        )}

        {/* 3. BUILD APK & GITHUB RELEASE GUIDE */}
        {activeMainTab === 'build_guide' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {isBengali ? 'অ্যান্ড্রয়েড স্টুডিওতে APK তৈরির পূর্ণাঙ্গ নির্দেশিকা' : 'Android Studio APK Build & Release Guide'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Step-by-step instructions to compile, sign, and release “চার্জিং সহকারী” (Charging Assistant) APK
                  </p>
                </div>
              </div>

              {/* Step 1: Open Project */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">1</span>
                  <span>{isBengali ? 'প্রজেক্ট অ্যান্ড্রয়েড স্টুডিওতে ওপেন ও সিঙ্ক করুন' : 'Open Project in Android Studio'}</span>
                </div>
                <p className="text-xs text-slate-300 pl-8">
                  {isBengali
                    ? 'উপরের "অ্যান্ড্রয়েড প্রজেক্ট ডাউনলোড (.ZIP)" বাটনে ক্লিক করে ফাইলটি আনজিপ করুন। এরপর Android Studio (Ladybug / Iguana বা নতুন) ওপেন করে File > Open দিয়ে ফোল্ডারটি সিলেক্ট করুন। Gradle সিঙ্ক সম্পন্ন হওয়া পর্যন্ত অপেক্ষা করুন।'
                    : 'Download and extract the ZIP file. Open Android Studio and select File > Open to open the directory. Wait for Gradle Sync to complete.'}
                </p>
              </div>

              {/* Step 2: Build Debug APK */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">2</span>
                  <span>{isBengali ? 'ডিবাগ APK তৈরি (Build Debug APK)' : 'Build Debug APK'}</span>
                </div>
                <p className="text-xs text-slate-300 pl-8">
                  {isBengali ? 'টার্মিনালে এই কমান্ডটি চালান:' : 'Run this command in your project terminal:'}
                </p>
                <div className="ml-8 p-3 rounded-lg bg-slate-900 font-mono text-xs text-emerald-300 flex items-center justify-between">
                  <span>./gradlew assembleDebug</span>
                  <button
                    onClick={() => navigator.clipboard.writeText('./gradlew assembleDebug')}
                    className="text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 pl-8">
                  {isBengali ? 'তৈরিকৃত APK পাওয়া যাবে:' : 'Generated APK path:'}{' '}
                  <code className="text-emerald-400">app/build/outputs/apk/debug/app-debug.apk</code>
                </p>
              </div>

              {/* Step 3: Build Release APK */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">3</span>
                  <span>{isBengali ? 'রিলিজ APK বা Signed APK তৈরি' : 'Generate Signed Release APK'}</span>
                </div>
                <p className="text-xs text-slate-300 pl-8">
                  {isBengali
                    ? 'Android Studio মেন্যু থেকে: Build > Generate Signed Bundle / APK... সিলেক্ট করুন। APK নির্বাচন করে আপনার সাইনিং কি-স্টোর দিন এবং V1 ও V2 সিগনেচার টিক দিয়ে Finish চাপুন।'
                    : 'In Android Studio menu: Build > Generate Signed Bundle / APK > Select APK > Choose or create keystore > Select V1 & V2 signatures > Finish.'}
                </p>
                <div className="ml-8 p-3 rounded-lg bg-slate-900 font-mono text-xs text-emerald-300 flex items-center justify-between">
                  <span>./gradlew assembleRelease</span>
                  <button
                    onClick={() => navigator.clipboard.writeText('./gradlew assembleRelease')}
                    className="text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Step 4: GitHub Release */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">4</span>
                  <span>{isBengali ? 'গিটহাবে আপলোড এবং গিটহাব রিলিজ পাবলিশ' : 'Upload to GitHub & Create Release'}</span>
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-300 pl-8 space-y-1.5">
                  <li>
                    {isBengali ? 'গিট ইনিশিয়ালাইজ করুন:' : 'Initialize git repository:'}{' '}
                    <code className="text-emerald-400">git init && git add . && git commit -m "Charging Assistant v1.0.0"</code>
                  </li>
                  <li>{isBengali ? 'আপনার GitHub রিপোজিটরিতে পুশ করুন।' : 'Push code to your GitHub repo.'}</li>
                  <li>
                    {isBengali
                      ? 'GitHub এর Releases ট্যাবে গিয়ে "Draft a new release" ক্লিক করে v1.0.0 ট্যাগ দিন।'
                      : 'Go to GitHub Releases > Draft a new release with tag v1.0.0.'}
                  </li>
                  <li>
                    {isBengali
                      ? 'তৈরিকৃত app-release.apk ফাইলটি ড্র্যাগ অ্যান্ড ড্রপ করে রিলিজ অ্যাসেট হিসেবে যুক্ত করে "Publish release" চাপুন।'
                      : 'Attach the app-release.apk file and click Publish release.'}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          “চার্জিং সহকারী” (Charging Assistant) • Complete Production-Ready Android App Architecture (API 26-35) • 100% Offline &amp; Private
        </p>
      </footer>
    </div>
  );
}
