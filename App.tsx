import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Fiscal, Viagem, ViagemSelecionada, Trecho, DashboardData, Passageiro, StatusEmbarque } from './types';
import Login from './components/Login';
import Scanner from './components/Scanner';
import { api } from './services/api';
import { BusIcon, CheckCircleIcon, ChevronDownIcon, FileTextIcon, LogOutIcon, PrinterIcon, QrCodeIcon, UsersIcon, XCircleIcon } from './components/icons';

// Sub-components defined in the same file to keep file count low, but outside the main component render flow.

const Header: React.FC<{ fiscal: Fiscal; onLogout: () => void }> = ({ fiscal, onLogout }) => (
    <header className="bg-gray-800 p-4 flex justify-between items-center sticky top-0 z-20 shadow-lg border-b border-gray-700">
        <div className="flex items-center space-x-3">
            <BusIcon className="h-8 w-8 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Controle de Embarque</h1>
        </div>
        <div className="flex items-center space-x-4">
            <span className="text-gray-300 hidden sm:block">Olá, {fiscal.NOME_DO_FISCAL}</span>
            <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Sair">
                <LogOutIcon className="h-6 w-6 text-red-400" />
            </button>
        </div>
    </header>
);

const TripSelector: React.FC<{ onTripSelect: (selection: ViagemSelecionada) => void }> = ({ onTripSelect }) => {
    const [viagens, setViagens] = useState<Viagem[]>([]);
    const [trecho, setTrecho] = useState<Trecho>(Trecho.IDA);
    const [selectedViagem, setSelectedViagem] = useState<string>('');
    const [veiculo, setVeiculo] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getViagens().then(data => {
            setViagens(data);
            setIsLoading(false);
        });
    }, []);

    const availableViagens = useMemo(() => {
        return viagens.filter(v => (trecho === Trecho.VOLTA && v.destino.includes('→')) || (trecho === Trecho.IDA));
    }, [viagens, trecho]);

    const availableVeiculos = useMemo(() => {
        const [destino, dataHora] = selectedViagem.split(' :: ');
        const viagem = viagens.find(v => v.destino === destino && v.dataHora === dataHora);
        return viagem ? viagem.veiculos : [];
    }, [selectedViagem, viagens]);

    useEffect(() => {
        setSelectedViagem('');
        setVeiculo('');
    }, [trecho]);
     
    useEffect(() => {
        setVeiculo('');
    }, [selectedViagem]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const [destino, dataHora] = selectedViagem.split(' :: ');
        onTripSelect({ trecho, destino, dataHora, veiculo });
    };

    if (isLoading) return <div className="text-center p-8">Carregando viagens...</div>;

    return (
        <div className="p-4 sm:p-6 bg-gray-800 rounded-lg max-w-2xl mx-auto my-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Selecionar Operação</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Trecho</label>
                    <select value={trecho} onChange={e => setTrecho(e.target.value as Trecho)} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500">
                        <option value={Trecho.IDA}>IDA</option>
                        <option value={Trecho.VOLTA}>VOLTA</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Viagem (Destino e Horário)</label>
                    <select value={selectedViagem} onChange={e => setSelectedViagem(e.target.value)} required className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="">Selecione a viagem</option>
                        {availableViagens.map(v => (
                            <option key={`${v.destino} :: ${v.dataHora}`} value={`${v.destino} :: ${v.dataHora}`}>
                                {v.destino} - {new Date(v.dataHora).toLocaleString('pt-BR', {day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'})}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedViagem && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Veículo</label>
                        <select value={veiculo} onChange={e => setVeiculo(e.target.value)} required className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500">
                            <option value="">Selecione o veículo</option>
                            {availableVeiculos.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                )}
                <button type="submit" disabled={!veiculo} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                    Iniciar Operação
                </button>
            </form>
        </div>
    );
};

const StatsDisplay: React.FC<{ data: DashboardData; selection: ViagemSelecionada }> = ({ data, selection }) => {
    const { statsGeral, statsPorVeiculo } = data;
    return (
        <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-400">Total Embarcado</h3>
                    <p className="text-3xl font-bold text-cyan-400">{statsGeral.embarcados}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-400">Total na Viagem</h3>
                    <p className="text-3xl font-bold text-white">{statsGeral.total}</p>
                </div>
                {selection.trecho === Trecho.VOLTA && (
                     <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400">Faltantes</h3>
                        <p className={`text-3xl font-bold ${statsGeral.faltantes === 0 ? 'text-green-400' : 'text-yellow-400'}`}>{statsGeral.faltantes}</p>
                    </div>
                )}
                 <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700 col-span-2 md:col-span-1">
                    <h3 className="text-sm font-medium text-gray-400">Seu Veículo</h3>
                     <p className="text-xl font-bold text-white truncate">{selection.veiculo}</p>
                     <p className="text-2xl font-semibold text-cyan-400">{statsPorVeiculo[selection.veiculo]?.embarcados || 0}</p>
                </div>
            </div>
        </div>
    );
};


const CheckinResult: React.FC<{ result: { type: 'success' | 'error'; message: string } | null; onDismiss: () => void }> = ({ result, onDismiss }) => {
    if (!result) return null;
    const isSuccess = result.type === 'success';
    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center p-4 mb-4 text-sm rounded-lg shadow-lg border ${
            isSuccess 
            ? 'bg-green-900 text-green-300 border-green-700' 
            : 'bg-red-900 text-red-300 border-red-700'
        }`} role="alert">
            {isSuccess ? <CheckCircleIcon className="w-5 h-5 mr-3"/> : <XCircleIcon className="w-5 h-5 mr-3"/>}
            <span className="font-medium">{result.message}</span>
            <button onClick={onDismiss} type="button" className="ml-4 -mr-1 -my-1.5 bg-transparent p-1.5 inline-flex h-8 w-8 rounded-lg focus:ring-2 hover:bg-white/10" aria-label="Dismiss">
                <span className="sr-only">Dismiss</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
            </button>
        </div>
    );
};

const PassengerList: React.FC<{ passengers: Passageiro[]; title: string; icon: React.ReactNode }> = ({ passengers, title, icon }) => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="font-semibold text-lg mb-3 flex items-center">
            {icon}
            <span className="ml-2">{title} ({passengers.length})</span>
        </h3>
        <div className="max-h-80 overflow-y-auto">
            {passengers.length > 0 ? (
                <ul className="divide-y divide-gray-700">
                    {passengers.map(p => (
                        <li key={`${p.ID_PULSEIRA}-${p.TIMESTAMP_EMBARQUE}`} className="py-2 flex justify-between items-center text-sm">
                           <div>
                                <p className="font-medium text-white">{p.NOME_CONVIDADO}</p>
                                <p className="text-gray-400">{p.ONIBUS_EMBARCADO?.split('[')[1].replace(']', '') || 'N/A'}</p>
                           </div>
                           <span className="text-xs text-gray-500">{p.TIMESTAMP_EMBARQUE?.split(' ')[1]}</span>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-gray-500 text-center py-4">Nenhum passageiro nesta lista.</p>}
        </div>
    </div>
);


const PrintableReport: React.FC<{ data: DashboardData | null, selection: ViagemSelecionada | null }> = ({ data, selection }) => {
    if (!data || !selection) return null;
    const allPassengers = [...data.passageirosEmbarcados].sort((a, b) => a.NOME_CONVIDADO.localeCompare(b.NOME_CONVIDADO));

    return (
        <div className="p-2 text-xs font-mono">
            <header className="text-center mb-4">
                <h1 className="font-bold text-sm">Controle de Embarque</h1>
                <p>{selection.destino}</p>
                <p>{new Date(selection.dataHora).toLocaleString('pt-BR')}</p>
                <p>Trecho: {selection.trecho}</p>
            </header>
            <section className="mb-2 border-t border-b border-dashed border-black py-1">
                <p>Total: {data.statsGeral.total}</p>
                <p>Embarcados: {data.statsGeral.embarcados}</p>
                {selection.trecho === Trecho.VOLTA && <p>Faltantes: {data.statsGeral.faltantes}</p>}
            </section>
            <section>
                <h2 className="font-bold text-center mb-1">Lista de Embarcados</h2>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left">Nome</th>
                            <th className="text-left">Veículo</th>
                            <th className="text-right">Hora</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allPassengers.map(p => (
                            <tr key={p.ID_PULSEIRA}>
                                <td>{p.NOME_CONVIDADO}</td>
                                <td>{p.ID_VEICULO}</td>
                                <td className="text-right">{p.TIMESTAMP_EMBARQUE?.split(' ')[1]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

// Main Dashboard Component
const Dashboard: React.FC<{ fiscal: Fiscal; onLogout: () => void }> = ({ fiscal, onLogout }) => {
    const [selection, setSelection] = useState<ViagemSelecionada | null>(null);
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [checkinResult, setCheckinResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [manualId, setManualId] = useState('');

    const fetchData = useCallback(async () => {
        if (!selection) return;
        setIsLoading(true);
        try {
            const dashboardData = await api.getDashboardData(selection);
            setData(dashboardData);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    }, [selection]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCheckIn = useCallback(async (id: string) => {
        if (!selection || !id) return;
        
        setCheckinResult(null);
        try {
            const passageiro = await api.performCheckIn(id, selection);
            setCheckinResult({ type: 'success', message: `Embarque de ${passageiro.NOME_CONVIDADO} registrado!` });
            fetchData(); // Refresh data
        } catch (err: any) {
            setCheckinResult({ type: 'error', message: err.message || 'Erro no check-in.' });
        } finally {
             setTimeout(() => setCheckinResult(null), 5000);
        }
    }, [selection, fetchData]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleCheckIn(manualId);
        setManualId('');
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const reportElement = document.getElementById('printable-report');
            if (reportElement) {
                printWindow.document.write('<html><head><title>Imprimir Relatório</title>');
                printWindow.document.write('<style>body { font-family: monospace; font-size: 10pt; width: 80mm; } table { width: 100%; border-collapse: collapse; } td, th { padding: 2px; } </style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(reportElement.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        }
    };
    
    if (!selection) {
        return <TripSelector onTripSelect={setSelection} />;
    }

    const { destino, dataHora, trecho, veiculo } = selection;
    const dataHoraViagemFormatada = new Date(dataHora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const rotuloViagem = `${trecho} | ${destino} (${dataHoraViagemFormatada}) [${veiculo}]`;

    return (
        <div className="p-4 sm:p-6">
            <CheckinResult result={checkinResult} onDismiss={() => setCheckinResult(null)} />
            <div id="printable-report" className="hidden print:block"><PrintableReport data={data} selection={selection}/></div>

            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-semibold text-cyan-300">{rotuloViagem}</h2>
                <div>
                     <button onClick={() => setSelection(null)} className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors mr-2">Trocar Viagem</button>
                </div>
            </div>
            
            {isLoading && !data ? <p>Carregando dados...</p> : data && (
                <>
                    <StatsDisplay data={data} selection={selection} />

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                             <h3 className="font-semibold text-lg mb-3 flex items-center"><QrCodeIcon className="w-5 h-5 mr-2" />Leitor de QR Code</h3>
                             <Scanner onScanSuccess={handleCheckIn} onScanError={(err) => setCheckinResult({type: 'error', message: err})} isPaused={!!checkinResult} />
                             <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
                                <input type="text" value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="Digitar ID da pulseira" className="flex-grow p-2 bg-gray-700 rounded-md border border-gray-600"/>
                                <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-2 rounded-md">Enviar</button>
                             </form>
                        </div>
                        <div className="space-y-4">
                             <PassengerList title="Embarcados" passengers={data.passageirosEmbarcados} icon={<CheckCircleIcon className="w-5 h-5 text-green-400" />} />
                             {trecho === Trecho.VOLTA && <PassengerList title="Faltantes" passengers={data.passageirosFaltantes} icon={<XCircleIcon className="w-5 h-5 text-yellow-400" />} />}
                        </div>
                    </div>
                    <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <h3 className="font-semibold text-lg mb-3">Relatórios</h3>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"><FileTextIcon className="w-5 h-5"/> Gerar PDF</button>
                            <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors"><PrinterIcon className="w-5 h-5"/> Impressão Térmica (80mm)</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// Top-level App Component
export default function App() {
  const [fiscal, setFiscal] = useState<Fiscal | null>(null);

  const handleLogin = (fiscalData: Fiscal) => {
    setFiscal(fiscalData);
  };

  const handleLogout = () => {
    setFiscal(null);
  };

  if (!fiscal) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header fiscal={fiscal} onLogout={handleLogout} />
        <main>
            <Dashboard fiscal={fiscal} onLogout={handleLogout} />
        </main>
    </div>
  );
}
