import { Passageiro, Fiscal, Trecho, StatusEmbarque, Viagem, DashboardData, ViagemSelecionada } from '../types';

// Mock database
let mockPassageiros: Passageiro[] = [
    { ID_PULSEIRA: 'QR001', NOME_CONVIDADO: 'Ana Silva', CPF: '111.111.111-11', DESTINO_ONIBUS: 'BRASÍLIA → BASE', DATA_HORA_VIAGEM: '2024-08-15 08:00', TRECHO: Trecho.IDA, GRUPO_VIAGEM: 'BRASÍLIA → BASE :: 2024-08-15 08:00', STATUS_EMBARQUE: StatusEmbarque.AGUARDANDO },
    { ID_PULSEIRA: 'QR002', NOME_CONVIDADO: 'Bruno Costa', CPF: '222.222.222-22', DESTINO_ONIBUS: 'BRASÍLIA → BASE', DATA_HORA_VIAGEM: '2024-08-15 08:00', TRECHO: Trecho.IDA, GRUPO_VIAGEM: 'BRASÍLIA → BASE :: 2024-08-15 08:00', STATUS_EMBARQUE: StatusEmbarque.AGUARDANDO },
    { ID_PULSEIRA: 'QR003', NOME_CONVIDADO: 'Carla Dias', CPF: '333.333.333-33', DESTINO_ONIBUS: 'BRASÍLIA → BASE', DATA_HORA_VIAGEM: '2024-08-15 08:00', TRECHO: Trecho.IDA, GRUPO_VIAGEM: 'BRASÍLIA → BASE :: 2024-08-15 08:00', STATUS_EMBARQUE: StatusEmbarque.AGUARDANDO },
    { ID_PULSEIRA: 'QR004', NOME_CONVIDADO: 'Daniel Martins', CPF: '444.444.444-44', DESTINO_ONIBUS: 'BRASÍLIA → BASE', DATA_HORA_VIAGEM: '2024-08-15 08:00', TRECHO: Trecho.IDA, GRUPO_VIAGEM: 'BRASÍLIA → BASE :: 2024-08-15 08:00', STATUS_EMBARQUE: StatusEmbarque.AGUARDANDO },
    { ID_PULSEIRA: 'QR005', NOME_CONVIDADO: 'Eduarda Souza', CPF: '555.555.555-55', DESTINO_ONIBUS: 'SÃO PAULO → HOTEL', DATA_HORA_VIAGEM: '2024-08-20 14:00', TRECHO: Trecho.IDA, GRUPO_VIAGEM: 'SÃO PAULO → HOTEL :: 2024-08-20 14:00', STATUS_EMBARQUE: StatusEmbarque.AGUARDANDO },
    { ID_PULSEIRA: 'QR001', NOME_CONVIDADO: 'Ana Silva', CPF: '111.111.111-11', DESTINO_ONIBUS: 'BRASÍLIA → BASE', DATA_HORA_VIAGEM: '2024-08-15 18:00', TRECHO: Trecho.VOLTA, GRUPO_VIAGEM: 'BRASÍLIA → BASE :: 2024-08-15 08:00', STATUS_EMBARQUE: StatusEmbarque.AGUARDANDO },
    { ID_PULSEIRA: 'QR002', NOME_CONVIDADO: 'Bruno Costa', CPF: '222.222.222-22', DESTINO_ONIBUS: 'BRASÍLIA → BASE', DATA_HORA_VIAGEM: '2024-08-15 18:00', TRECHO: Trecho.VOLTA, GRUPO_VIAGEM: 'BRASÍLIA → BASE :: 2024-08-15 08:00', STATUS_EMBARQUE: StatusEmbarque.AGUARDANDO },
];

const mockFiscais: { [user: string]: { hash: string, fiscal: Fiscal } } = {
    'fiscal1': { hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', fiscal: { NOME_DO_FISCAL: 'Fiscal A' } }, // password: '123'
    'fiscal2': { hash: '60303ae22b998861bce3b28f33e53be60012defada0c7910978644434250283c', fiscal: { NOME_DO_FISCAL: 'Fiscal B' } }, // password: '456'
};

const mockViagens: Viagem[] = [
    { destino: 'BRASÍLIA → BASE', dataHora: '2024-08-15 08:00', veiculos: ['Ônibus 1', 'Ônibus 2'] },
    { destino: 'BRASÍLIA → BASE', dataHora: '2024-08-15 18:00', veiculos: ['Ônibus 1', 'Ônibus 2', 'Van 1'] },
    { destino: 'SÃO PAULO → HOTEL', dataHora: '2024-08-20 14:00', veiculos: ['Micro-ônibus A'] },
];

const sha256 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));


export const api = {
    login: async (user: string, pass: string): Promise<Fiscal> => {
        await simulateDelay(500);
        const passHash = await sha256(pass);
        const fiscalData = mockFiscais[user.toLowerCase()];
        if (fiscalData && fiscalData.hash === passHash) {
            return fiscalData.fiscal;
        }
        throw new Error('Usuário ou senha inválidos.');
    },

    getViagens: async (): Promise<Viagem[]> => {
        await simulateDelay(300);
        return mockViagens;
    },

    getDashboardData: async (selection: ViagemSelecionada): Promise<DashboardData> => {
        await simulateDelay(400);
        const grupoViagem = `${selection.destino} :: ${selection.dataHora}`;
        
        const passageirosIdaEmbarcados = mockPassageiros.filter(p => p.GRUPO_VIAGEM === grupoViagem && p.TRECHO === Trecho.IDA && p.STATUS_EMBARQUE === StatusEmbarque.EMBARCADO);

        let passageirosDoTrecho: Passageiro[];
        if(selection.trecho === Trecho.IDA){
            passageirosDoTrecho = mockPassageiros.filter(p => p.GRUPO_VIAGEM === grupoViagem && p.TRECHO === Trecho.IDA);
        } else { // VOLTA
             passageirosDoTrecho = mockPassageiros.filter(p => p.GRUPO_VIAGEM === grupoViagem && p.TRECHO === Trecho.VOLTA);
        }

        const embarcados = passageirosDoTrecho.filter(p => p.STATUS_EMBARQUE === StatusEmbarque.EMBARCADO);

        const statsGeral: DashboardData['statsGeral'] = {
            embarcados: embarcados.length,
            total: selection.trecho === Trecho.IDA ? passageirosDoTrecho.length : passageirosIdaEmbarcados.length,
        };
        
        if (selection.trecho === Trecho.VOLTA) {
            const idsVoltaram = new Set(embarcados.map(p => p.ID_PULSEIRA));
            const faltantes = passageirosIdaEmbarcados.filter(p => !idsVoltaram.has(p.ID_PULSEIRA));
            statsGeral.faltantes = faltantes.length;
        }

        const statsPorVeiculo: DashboardData['statsPorVeiculo'] = {};
        const viagem = mockViagens.find(v => v.destino === selection.destino && (v.dataHora === selection.dataHora || selection.trecho === Trecho.VOLTA)); // A volta pode ter data diferente
        viagem?.veiculos.forEach(v => {
            const embarcadosNoVeiculo = embarcados.filter(p => p.ONIBUS_EMBARCADO?.endsWith(`[${v}]`));
            statsPorVeiculo[v] = { embarcados: embarcadosNoVeiculo.length, total: 0 }; // Total por veículo é complexo no mock
        });
        
        const idsVoltaram = new Set(embarcados.map(p => p.ID_PULSEIRA));

        return {
            statsGeral,
            statsPorVeiculo,
            passageirosEmbarcados: embarcados.sort((a,b) => a.NOME_CONVIDADO.localeCompare(b.NOME_CONVIDADO)),
            passageirosFaltantes: selection.trecho === Trecho.VOLTA ? passageirosIdaEmbarcados.filter(p => !idsVoltaram.has(p.ID_PULSEIRA)).sort((a,b) => a.NOME_CONVIDADO.localeCompare(b.NOME_CONVIDADO)) : []
        };
    },

    performCheckIn: async (idPulseira: string, selection: ViagemSelecionada): Promise<Passageiro> => {
        await simulateDelay(600);
        const grupoViagem = `${selection.destino} :: ${selection.dataHora}`;

        let passageiro = mockPassageiros.find(p => 
            p.ID_PULSEIRA === idPulseira && 
            p.GRUPO_VIAGEM === grupoViagem && 
            p.TRECHO === selection.trecho
        );

        if (!passageiro) { // Criação sob demanda se não existir
            const passageiroInfo = mockPassageiros.find(p => p.ID_PULSEIRA === idPulseira);
            if (!passageiroInfo) throw new Error('ID da pulseira não encontrado no cadastro.');
            
            passageiro = {
                ...passageiroInfo,
                TRECHO: selection.trecho,
                GRUPO_VIAGEM: grupoViagem,
                STATUS_EMBARQUE: StatusEmbarque.AGUARDANDO,
                ID_VEICULO: undefined,
                TIMESTAMP_EMBARQUE: undefined,
            };
            mockPassageiros.push(passageiro);
        }

        if (passageiro.STATUS_EMBARQUE === StatusEmbarque.EMBARCADO) {
            throw new Error(`Passageiro ${passageiro.NOME_CONVIDADO} já embarcou em ${passageiro.ONIBUS_EMBARCADO}.`);
        }

        if (selection.trecho === Trecho.VOLTA) {
            const foiNaIda = mockPassageiros.some(p => 
                p.ID_PULSEIRA === idPulseira && 
                p.GRUPO_VIAGEM === grupoViagem &&
                p.TRECHO === Trecho.IDA &&
                p.STATUS_EMBARQUE === StatusEmbarque.EMBARCADO
            );
            if (!foiNaIda) {
                // Em um cenário real, poderia perguntar se permite embarcar mesmo assim.
                // throw new Error(`Passageiro ${passageiro.NOME_CONVIDADO} não embarcou na IDA.`);
                console.warn(`Passageiro ${passageiro.NOME_CONVIDADO} não embarcou na IDA, mas foi permitido na VOLTA.`);
            }
        }
        
        passageiro.STATUS_EMBARQUE = StatusEmbarque.EMBARCADO;
        const dataHoraViagemFormatada = new Date(selection.dataHora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        passageiro.ONIBUS_EMBARCADO = `${selection.trecho} | ${selection.destino} (${dataHoraViagemFormatada}) [${selection.veiculo}]`;
        passageiro.TIMESTAMP_EMBARQUE = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        passageiro.ID_VEICULO = selection.veiculo;
        
        return passageiro;
    }
};
