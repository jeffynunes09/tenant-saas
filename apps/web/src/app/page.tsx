export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-4">
          Sistema de Agendamento Multi-tenant SaaS
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Dashboard Web - Next.js 15 + React 19
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
            <p className="text-gray-600">
              Visualize métricas e analytics do seu negócio
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Agendamentos</h2>
            <p className="text-gray-600">
              Gerencie todos os agendamentos em tempo real
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Clientes</h2>
            <p className="text-gray-600">
              Cadastre e gerencie seus clientes
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
