import { useState, useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'

// ==========================================
// 1. COMPOSANT GRAPHIQUE ROBUSTE (Anti-Crash)
// ==========================================
const Chart = ({ data, color }) => {
  const chartContainerRef = useRef()
  const chartRef = useRef()
  const seriesRef = useRef()
  const initializedRef = useRef(false) 

  useEffect(() => {
    // Si le conteneur n'existe pas encore, on ne fait rien (évite le crash)
    if (!chartContainerRef.current) return

    try {
      // Configuration simplifiée pour compatibilité maximale
      const chart = createChart(chartContainerRef.current, {
        layout: { 
          background: { color: 'transparent' }, 
          textColor: '#94a3b8',
        },
        grid: { 
          vertLines: { color: '#1e293b' }, 
          horzLines: { color: '#1e293b' } 
        },
        width: chartContainerRef.current.clientWidth,
        height: 280,
        timeScale: { timeVisible: true, secondsVisible: true },
      })

      const areaSeries = chart.addAreaSeries({
        lineColor: color, 
        topColor: color, 
        bottomColor: 'rgba(0, 0, 0, 0)', 
        lineWidth: 2,
      })

      chartRef.current = chart
      seriesRef.current = areaSeries

      // Gestion redimensionnement
      const handleResize = () => {
          if (chartRef.current && chartContainerRef.current) {
              chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
          }
      }
      window.addEventListener('resize', handleResize)

      return () => { 
          window.removeEventListener('resize', handleResize)
          chart.remove() 
      }
    } catch (err) {
      console.error("Erreur chargement graphique:", err)
    }
  }, [color])

  // Mise à jour des données
  useEffect(() => {
    if (data && seriesRef.current) {
      const now = Math.floor(Date.now() / 1000)

      // Faux historique pour l'esthétique
      if (!initializedRef.current) {
        const fakeHistory = []
        let price = data.price
        for (let i = 50; i > 0; i--) {
          price = price + (Math.random() - 0.5) * (price * 0.005)
          fakeHistory.push({ time: now - (i * 3), value: price })
        }
        fakeHistory.sort((a, b) => a.time - b.time)
        seriesRef.current.setData(fakeHistory)
        initializedRef.current = true
      }

      // Mise à jour temps réel
      try {
        seriesRef.current.update({ time: now, value: data.price })
      } catch (e) { 
        // Ignorer erreurs mineures de timestamp
      }
    }
  }, [data])

  return <div ref={chartContainerRef} className="w-full h-[280px] mt-4 rounded-xl overflow-hidden border border-gray-700 shadow-inner relative z-0" />
}

// ==========================================
// 2. LANDING PAGE
// ==========================================
const LandingPage = ({ onBuy, onGoAdmin }) => (
  <div className="min-h-screen bg-[#0B0E14] text-white font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden">
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[128px]" />
    </div>

    <nav className="relative z-50 w-full border-b border-white/5 bg-[#0B0E14]/80 backdrop-blur-md sticky top-0">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg">
            <span className="font-bold text-white">T</span>
          </div>
          <span className="text-xl font-bold tracking-tight">TradeSense<span className="text-blue-500">.ai</span></span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onGoAdmin} className="text-sm text-gray-500 hover:text-white transition-colors">Admin</button>
          <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition">
            Commencer
          </button>
        </div>
      </div>
    </nav>

    <div className="relative z-10 pt-20 pb-32 px-6 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          V2.0 LIVE
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
        Ne risquez plus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">votre capital.</span>
      </h1>
      <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
        Obtenez jusqu'à 100,000 $ de fonds. Gardez 90% des profits.
      </p>

      <div id="pricing" className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="bg-[#151921] p-8 rounded-3xl border border-white/10 hover:border-gray-500 transition">
            <h3 className="text-gray-400 font-bold text-sm mb-4">STARTER</h3>
            <p className="text-4xl font-bold mb-6">200 DH</p>
            <button onClick={() => onBuy(200, 'STARTER')} className="w-full py-4 rounded-xl bg-gray-800 hover:bg-white hover:text-black font-bold border border-white/10 transition">Choisir</button>
        </div>
        <div className="bg-[#1A1F2E] p-8 rounded-3xl border border-blue-500 shadow-2xl transform md:scale-105">
            <h3 className="text-blue-400 font-bold text-sm mb-4">PRO</h3>
            <p className="text-5xl font-bold mb-6">500 DH</p>
            <button onClick={() => onBuy(500, 'PRO')} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold shadow-lg transition">Devenir Trader</button>
        </div>
        <div className="bg-[#151921] p-8 rounded-3xl border border-white/10 hover:border-purple-500 transition">
            <h3 className="text-purple-400 font-bold text-sm mb-4">ELITE</h3>
            <p className="text-4xl font-bold mb-6">1000 DH</p>
            <button onClick={() => onBuy(1000, 'ELITE')} className="w-full py-4 rounded-xl bg-gray-800 hover:bg-white hover:text-black font-bold border border-white/10 transition">Choisir</button>
        </div>
      </div>
    </div>
  </div>
)

// ==========================================
// 3. PAIEMENT
// ==========================================
const PaymentGateway = ({ plan, amount, onConfirm, onCancel }) => {
  const [method, setMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePay = () => {
    setIsProcessing(true)
    setTimeout(() => onConfirm(), 2500)
  }

  if (isProcessing) return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center text-white z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-6"></div>
        <h2 className="text-xl font-bold animate-pulse">Traitement Sécurisé...</h2>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1F2B] w-full max-w-md rounded-2xl border border-gray-700 p-6 shadow-2xl animate-bounce">
        <div className="flex justify-between mb-6 border-b border-gray-700 pb-4">
            <h3 className="text-white font-bold text-lg">Checkout : {plan}</h3>
            <button onClick={onCancel} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <div className="flex gap-2 mb-6">
            <button onClick={() => setMethod('card')} className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-all ${method === 'card' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-gray-600 text-gray-400'}`}>💳 Carte / CMI</button>
            <button onClick={() => setMethod('crypto')} className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-all ${method === 'crypto' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-transparent border-gray-600 text-gray-400'}`}>₿ Crypto</button>
        </div>
        <div className="space-y-4 mb-8">
            {method === 'card' ? (
                <div>
                    <input type="text" placeholder="Numéro de Carte" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white mb-3" />
                    <div className="flex gap-4">
                        <input type="text" placeholder="MM/YY" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white" />
                        <input type="text" placeholder="CVC" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white" />
                    </div>
                </div>
            ) : (
                <div className="text-center py-6 border border-dashed border-gray-600 rounded-lg bg-gray-800/30">
                    <p className="text-sm text-gray-300 font-bold">USDT (TRC20)</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono break-all px-4">TVJMq7...8xLp</p>
                </div>
            )}
        </div>
        <button onClick={handlePay} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all">
            Payer {amount} DH
        </button>
      </div>
    </div>
  )
}

// ==========================================
// 4. DASHBOARD INTERACTIF
// ==========================================
const Dashboard = ({ account, btcData, iamData, onTrade, notification }) => (
  <div className="min-h-screen bg-[#0B0E14] text-white p-4 md:p-8 animate-fade-in">
    {notification && (
        <div className="fixed top-5 right-5 z-50 bg-blue-600 px-6 py-3 rounded-xl shadow-2xl animate-bounce font-bold border border-blue-400 flex items-center gap-2">
            <span>🚀</span> {notification}
        </div>
    )}

    <header className="mb-10 flex flex-col md:flex-row justify-between items-center border-b border-gray-800 pb-6 bg-[#151921] p-6 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        TradeSense AI
      </h1>
      
      {account && (
        <div className="text-right mt-4 md:mt-0 bg-black/30 p-4 rounded-xl border border-gray-700 min-w-[200px]">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Equity Actuelle</p>
          <p className={`text-3xl font-mono font-bold ${account.balance < account.start_balance ? 'text-red-500' : 'text-green-400'}`}>
            ${account.balance.toLocaleString()}
          </p>
          <div className="flex justify-end mt-1">
             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                account.status === 'active' ? 'bg-blue-900/30 text-blue-400 border border-blue-800' :
                account.status === 'failed' ? 'bg-red-900/30 text-red-400 border border-red-800' :
                'bg-green-900/30 text-green-400 border border-green-800'
             }`}>
                {account.status}
             </span>
          </div>
        </div>
      )}
    </header>

    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* BTC */}
      <div className="bg-[#151921] p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-gray-700 transition-colors">
        <div className="flex justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-sm">₿</div>
                Bitcoin
            </h2>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-700">BTC-USD</span>
        </div>
        
        {btcData ? (
            <>
                <div className="flex items-baseline gap-4 mb-2">
                    <p className="text-4xl font-mono font-bold tracking-tighter">${btcData.price.toLocaleString()}</p>
                    <p className={`text-lg font-medium ${btcData.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {btcData.change >= 0 ? "+" : ""}{btcData.change}%
                    </p>
                </div>
                <Chart data={btcData} color="#22c55e" />
            </>
        ) : <div className="h-[280px] flex items-center justify-center text-gray-500 animate-pulse">Chargement...</div>}

        <div className="grid grid-cols-2 gap-4 mt-6">
            <button onClick={() => onTrade('BTC-USD', 'BUY')} className="bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white font-bold py-3 rounded-xl border border-green-600/50 transition-all">ACHETER</button>
            <button onClick={() => onTrade('BTC-USD', 'SELL')} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-bold py-3 rounded-xl border border-red-600/50 transition-all">VENDRE</button>
        </div>
      </div>

      {/* IAM */}
      <div className="bg-[#151921] p-6 rounded-2xl border border-gray-800 shadow-xl hover:border-gray-700 transition-colors">
         <div className="flex justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-600/20 flex items-center justify-center text-orange-600 text-sm">M</div>
                Maroc Telecom
            </h2>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-700">BVC</span>
         </div>
         
         {iamData ? (
            <>
                <div className="flex items-baseline gap-4 mb-2">
                    <p className="text-4xl font-mono font-bold tracking-tighter">{iamData.price} MAD</p>
                    <p className={`text-lg font-medium ${iamData.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {iamData.change >= 0 ? "+" : ""}{iamData.change}%
                    </p>
                </div>
                <Chart data={iamData} color="#f97316" />
            </>
        ) : <div className="h-[280px] flex items-center justify-center text-gray-500 animate-pulse">Connexion Casablanca...</div>}

        <div className="grid grid-cols-2 gap-4 mt-6">
            <button onClick={() => onTrade('IAM', 'BUY')} className="bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white font-bold py-3 rounded-xl border border-green-600/50 transition-all">ACHETER</button>
            <button onClick={() => onTrade('IAM', 'SELL')} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-bold py-3 rounded-xl border border-red-600/50 transition-all">VENDRE</button>
        </div>
      </div>
    </div>
  </div>
)

// ==========================================
// 5. APPLICATION PRINCIPALE
// ==========================================
function App() {
  const [view, setView] = useState('landing')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [btcData, setBtcData] = useState(null)
  const [iamData, setIamData] = useState(null)
  const [account, setAccount] = useState(null)
  const [notification, setNotification] = useState("")

  const handleSelectPlan = (price, name) => { 
      setSelectedPlan({ price, name })
      setView('payment') 
  }

  const handlePaymentSuccess = async () => {
    try { 
        await fetch('http://127.0.0.1:5000/api/start_challenge', { method: 'POST' })
        await fetchAccount()
        setView('dashboard') 
    } catch (e) { console.error("Erreur start challenge", e) }
  }

  const fetchAccount = async () => { 
      try { 
          const res = await fetch('http://127.0.0.1:5000/api/account')
          const data = await res.json()
          if(data) setAccount(data) 
      } catch (e) { console.error(e) } 
  }

  const fetchPrice = async (ticker, setFunction) => { 
      try { 
          const response = await fetch(`http://127.0.0.1:5000/api/price/${ticker}`)
          const data = await response.json()
          setFunction(data) 
      } catch (e) { console.error(e) } 
  }

  const handleTrade = async (ticker, type) => {
    if (!account) return
    try {
      const res = await fetch('http://127.0.0.1:5000/api/trade', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ ticker, type, amount: 500 }) 
      })
      const result = await res.json()
      
      if (res.ok) { 
          setNotification(`Ordre Exécuté: ${type} ${ticker}`)
          fetchAccount() 
      } else { 
          setNotification(`Erreur: ${result.error}`) 
      }
      setTimeout(() => setNotification(""), 3000)
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    if (view === 'dashboard') {
      fetchPrice('BTC-USD', setBtcData)
      fetchPrice('IAM', setIamData)
      const interval = setInterval(() => { 
          fetchPrice('BTC-USD', setBtcData)
          fetchPrice('IAM', setIamData)
          fetchAccount() 
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [view])

  if (view === 'landing') return <LandingPage onBuy={handleSelectPlan} />
  
  if (view === 'payment') return (
    <PaymentGateway 
        plan={selectedPlan.name} 
        amount={selectedPlan.price} 
        onConfirm={handlePaymentSuccess} 
        onCancel={() => setView('landing')} 
    />
  )
  
  return (
    <Dashboard 
        account={account} 
        btcData={btcData} 
        iamData={iamData} 
        onTrade={handleTrade} 
        notification={notification} 
    />
  )
}

export default App