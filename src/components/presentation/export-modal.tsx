import { useState } from 'react';
import { Presentation } from '@/lib/presentation-types';
import { 
  FileDown, Printer, FileCode, Check, Copy, X, 
  HelpCircle, ChevronRight, Sliders, Presentation as PresIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExportModalProps {
  presentation: Presentation;
  onClose: () => void;
}

export function ExportModal({ presentation, onClose }: ExportModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'json' | 'pdf'>('architecture');

  // Generate standardized JSON representation
  const formatPresentationJSON = () => {
    const exportSchema = {
      $schema: "http://industrial-os.org/schemas/presentation-v1.json",
      exporterVersion: "1.0.0-beta",
      timestamp: new Date().toISOString(),
      branding: {
        theme: "Industrial-OS-Dark",
        primaryColor: "#3B82F6",
        secondaryColor: "#1E293B",
        fontHeading: "Inter",
        fontMono: "JetBrains Mono"
      },
      data: {
        id: presentation.id,
        title: presentation.title,
        description: presentation.description,
        category: presentation.category,
        status: presentation.status,
        slideCount: presentation.slides.length,
        slides: presentation.slides.map((slide, idx) => ({
          slideIndex: idx,
          id: slide.id,
          layout: slide.layout || 'text-only',
          title: slide.titulo || slide.title,
          subtitle: slide.subtitulo || slide.subtitle,
          bodyText: slide.texto || slide.freeText,
          icon: slide.iconName || "Presentation",
          media: slide.video_url || slide.videoUrl || slide.imagem_url || slide.imageUrl ? {
            type: slide.video_url || slide.videoUrl ? 'video' : 'image',
            url: slide.video_url || slide.videoUrl || slide.imagem_url || slide.imageUrl
          } : null,
          bulletPoints: slide.listItems?.map(item => item.text) || slide.topicos || []
        }))
      }
    };
    return JSON.stringify(exportSchema, null, 2);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(formatPresentationJSON());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger dedicated print routine
  const triggerPrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header toolbar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900">
          <div>
            <span className="text-[10px] font-bold font-mono tracking-widest text-blue-400 block uppercase">
              EXPORT PIPELINE ARCHITECTURE
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              <FileDown className="w-5 h-5 text-blue-400" />
              Exportar Apresentação de Treinamento
            </h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-5 text-sm">
          <Button
            onClick={() => setActiveTab('architecture')}
            variant="ghost"
            className={cn(
              "px-4 py-3 font-semibold border-b-2 transition flex items-center gap-2 rounded-none",
              activeTab === 'architecture'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            <Sliders className="w-4 h-4" />
            Estrutura & Mock de PowerPoint
          </Button>
          <Button
            onClick={() => setActiveTab('json')}
            variant="ghost"
            className={cn(
              "px-4 py-3 font-semibold border-b-2 transition flex items-center gap-2 rounded-none",
              activeTab === 'json'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            <FileCode className="w-4 h-4" />
            Esquema JSON de Intercâmbio
          </Button>
          <Button
            onClick={() => setActiveTab('pdf')}
            variant="ghost"
            className={cn(
              "px-4 py-3 font-semibold border-b-2 transition flex items-center gap-2 rounded-none",
              activeTab === 'pdf'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            )}
          >
            <Printer className="w-4 h-4" />
            Imprimir ou Gerar PDF Direto
          </Button>
        </div>

        {/* Main tabs viewports */}
        <div className="flex-grow p-6 overflow-y-auto">
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="bg-blue-950/20 rounded-xl p-4 border border-blue-900/30 flex gap-3 text-sm text-slate-300">
                <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-300">Prontidão de Geração no Próximo Estágio</p>
                  <p className="mt-1 text-slate-400 leading-snug">
                    A arquitetura foi desenhada para integrar perfeitamente com bibliotecas como <code className="bg-blue-950/40 px-1 py-0.2 rounded font-mono text-xs text-blue-400">PptxGenJS</code> (JavaScript cliente/servidor) ou <code className="bg-blue-950/40 px-1 py-0.2 rounded font-mono text-xs text-blue-400">python-pptx</code>. O esquema de slides abaixo está 100% qualificado para essa modelagem.
                  </p>
                </div>
              </div>

              {/* Dynamic blueprint rendering */}
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-3 block">
                  Células de Engenharia do Documento PowerPoint (.pptx)
                </h3>
                <div className="border border-slate-700 rounded-xl overflow-hidden">
                  <div className="bg-slate-800 p-3 font-mono text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between border-b border-slate-700">
                    <span>PowerPoint Map Structure</span>
                    <span>Industrial OS Style Preset</span>
                  </div>
                  <div className="divide-y divide-slate-700 text-xs bg-slate-900">
                    {presentation.slides.map((slide, idx) => (
                      <div key={idx} className="p-4 hover:bg-slate-800/50 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded bg-slate-800 text-blue-400 border border-slate-700 font-mono flex items-center justify-center font-bold shrink-0 text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-200">{slide.titulo || slide.title}</p>
                            <p className="text-slate-500 font-mono text-[10.5px]">Layout: {slide.layout || 'text-only'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col text-slate-400 md:text-right text-[10.5px] font-mono shrink-0">
                          <span>Caixas de texto: {slide.texto || slide.freeText ? '1 principal' : '0'}</span>
                          <span>Lista: {slide.listItems?.length || slide.topicos?.length || 0} bullets</span>
                          <span>Media: {slide.imagem_url || slide.imageUrl || slide.video_url || slide.videoUrl ? 'Inserido' : 'Nenhuma'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Blueprint process summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="font-bold text-slate-300 block mb-1">Passo 1: Leitura de Nós</span>
                  <p className="text-slate-400 leading-relaxed">
                    A API carrega a matriz de slides cadastrados, convertendo listItems e parágrafos em blocos estruturados.
                  </p>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="font-bold text-slate-300 block mb-1">Passo 2: Injeção de Template</span>
                  <p className="text-slate-400 leading-relaxed">
                    Aplica paleta de cores institucional de alta legibilidade corporativa (Slate + Blue Industrial).
                  </p>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="font-bold text-slate-300 block mb-1">Passo 3: Geração Final</span>
                  <p className="text-slate-400 leading-relaxed">
                    Gera e entrega o binário PPTX convertido para download local do administrador.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Objeto Íntegro da Apresentação</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Use este JSON estruturado para restaurar dados, migrar sistemas ou alimentar scripts customizados.</p>
                </div>
                <Button
                  onClick={handleCopyJSON}
                  size="sm"
                  className="gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar JSON
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 text-[#71CDFF] p-4 rounded-xl text-xs font-mono overflow-auto max-h-[380px] border border-slate-700 leading-relaxed">
                  {formatPresentationJSON()}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'pdf' && (
            <div className="space-y-5">
              <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <h3 className="font-bold text-white text-sm mb-2">Impressão Direta do Navegador (Fidelidade PDF)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Implementamos um **Estilo de Impressão Industrial de alta legibilidade (@media print)** no Presentation Builder. Ao acionar o botão abaixo:
                </p>
                <div className="space-y-2 mt-4 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                    Cada slide se auto-organiza em uma única página exclusiva e limpa.
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                    O fundo escuro se ajusta para branco puro poupando cartucho e otimizando leitura.
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                    Ideal para apostilamento impresso e manuais complementares no chão de fábrica.
                  </div>
                </div>
                <p className="text-[10.5px] font-mono text-slate-400 mt-4 bg-slate-900 p-2.5 border border-slate-700 rounded">
                  💡 RECOMENDAÇÃO: Na caixa de diálogo de impressão do navegador, marque <strong>"Salvar como PDF"</strong> de forma horizontal e remova cabeçalhos do navegador para obter o acabamento mais refinado.
                </p>
              </div>

              <div className="flex justify-center py-4">
                <Button
                  onClick={triggerPrintPDF}
                  size="lg"
                  className="gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Visualizar e Imprimir Apresentação
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 text-right">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Fechar Janela
          </Button>
        </div>
      </div>
    </div>
  );
}
