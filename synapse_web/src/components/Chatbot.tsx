"use client"

export default function Chatbot() {

  return (
    <div className="flex bg-white">
      <main className="bg-gray-100 h-screen w-screen">
          <p className="text-2xl font-bold text-white mb-4 text-center bg-green-800 rounded-r-full py-2">SYNAPSE</p>

          <main className="max-h-64 overflow-y-auto">
            <p>Historial de conversación</p>
          </main>

          <form className="flex flex-row">
            <input className="rounded-full h-8 bg-white" placeholder="Tienes alguna duda"></input>
            <button type="submit" className="max-h-8 min-w-20 rounded-4xl bg-green-500">Enviar</button>
          </form>
      </main>
    </div>
  )
}
