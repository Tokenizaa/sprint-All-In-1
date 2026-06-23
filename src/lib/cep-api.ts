// CEP API integration using ViaCEP (free Brazilian API)

export interface AddressData {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  erro?: string;
}

export async function fetchAddressByCEP(cep: string): Promise<AddressData> {
  const cleanedCEP = cep.replace(/\D/g, '');
  
  if (cleanedCEP.length !== 8) {
    return { logradouro: '', bairro: '', cidade: '', estado: '', erro: 'CEP inválido' };
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`);
    const data = await response.json();

    if (data.erro) {
      return { logradouro: '', bairro: '', cidade: '', estado: '', erro: 'CEP não encontrado' };
    }

    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || '',
    };
  } catch (error) {
    return { logradouro: '', bairro: '', cidade: '', estado: '', erro: 'Erro ao buscar CEP' };
  }
}
