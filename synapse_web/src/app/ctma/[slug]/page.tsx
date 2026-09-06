import Link from "next/link"
import { ArrowLeft, ExternalLink, Info } from "lucide-react"
import { ImageZoom } from "@/components/ImageZoom"
import { GalleryTrigger } from "@/components/GalleryTrigger"

// Diccionario con contenido real simulado
const pageContent: Record<string, { title: string, content: React.ReactNode }> = {
  "mision-y-vision": {
    title: "Misión y Visión",
    content: (
      <>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Misión</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          El SENA está encargado de cumplir la función que le corresponde al Estado de invertir en el desarrollo social y técnico de los trabajadores colombianos, ofreciendo y ejecutando la formación profesional integral, para la incorporación y el desarrollo de las personas en actividades productivas que contribuyan al desarrollo social, económico y tecnológico del país (Ley 119/1994).
        </p>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Visión</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          En el 2026, el SENA liderará la formación profesional integral impulsando la innovación, el emprendimiento, la equidad, el desarrollo tecnológico y la competitividad en Colombia, promoviendo el trabajo decente y el bienestar de los colombianos.
        </p>
      </>
    )
  },
  "promesa-de-valor": {
    title: "Promesa de Valor",
    content: (
      <div className="flex justify-center my-6 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <ImageZoom 
          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgP1V5c2lsk-WXnlrf_YCS0qHh6BN_2V2_3pnVbCq6cOBwiXlZk0wFfoW3EPGIl5rCHIY9Vs5htiCw1YEdfR_ter4BAGmaQq89hq8zo315Cbx8Tihh2qWCIV1dApseYw6599iwVlCjmSDbd/s0/2.+Promesa+de+valor-01.png" 
          alt="Promesa de Valor CTMA"
          className="relative rounded-xl shadow-lg w-full max-w-7xl transform transition-transform duration-700 hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
    )
  },
  "organigrama": {
    title: "Organigrama del CTMA",
    content: (
      <div className="flex justify-center my-6 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <ImageZoom 
          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhFHPfanPZjm2uUK0Bki55SD0TQ9oN_ORD9ZAfyR7JrazHwaysqzO6ximuQygQEvVGYXTeqTe1QdZQflzZ_1jtSDmW-FAjDUweB52fXsvsd8tbpOcDUyiufKha2_nnbhHZiA-oFP042Qv7V/s0/3.+Organigrama-01.png" 
          alt="Organigrama CTMA"
          className="relative rounded-xl shadow-lg w-full w-full bg-white p-4 transform transition-transform duration-700 hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
    )
  },
  "contactenos": {
    title: "Contáctenos",
    content: (
      <div className="space-y-10">
        <div className="flex flex-col gap-6 items-center">
          <ImageZoom 
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfyG1rQRjJJ3OC40Q6zdQyLwXwF9ikZKVRLeghhXyafCl-urVl1wHrDLswugjQG3tFPVF0_pRLmMWkDymbkFAcjeN15KZY-zHQGtjVyUuVhuv61q1gzTQVjm2V5vIoJi0rdXD-WFIZ1pj6JofV16KW60U1GNicU0D6ggl0CLiieq1jK-lp-yTM7NzxbIpO/s0/Directorio.jpg" 
            alt="Directorio CTMA"
            className="rounded-xl shadow-md w-full max-w-7xl transform transition-transform duration-500 hover:scale-[1.01]"
            loading="lazy"
          />
          <ImageZoom 
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgzZN4cYrfFrX7TSAmlOCrd_a0_L8fC7J9OfgNox23Ws263VSgVs-Pj1lnSvtz1XQJHLm0Ingq33oN9v9BLXPmKA4cyBkJbG1DaSm4B_-KgNW0VqKqZTzZwYGXz2RXOjwUSjJLLBKe1dB70gkkfJzGyK2P-gvWQ1vlWKZkWlsq-vVhyphenhyphen0f_NzYjMS8FQ4bgs/s0/3.jpg" 
            alt="Contacto 1"
            className="rounded-xl shadow-md w-full max-w-7xl transform transition-transform duration-500 hover:scale-[1.01]"
            loading="lazy"
          />
          <ImageZoom 
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgchLU_EUuaaRzf0SqeUu7a2ffOze5zA5N_qpCI7f9CQqwD1iPmeRLCTmuUzaTfgdJ43GYbcTPfTnegmafgCJvFY6aos4W8WvzLAFcrmGkKkblWCxGWlEf3uufhTakCX028a6SkpF8e4pjddGx8_ABpgdrMbHWGWdib8RpvJlqzXEZODfhQPkiIgQnsfLEy/s0/5.jpg" 
            alt="Contacto 2"
            className="rounded-xl shadow-md w-full max-w-7xl transform transition-transform duration-500 hover:scale-[1.01]"
            loading="lazy"
          />
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-center shadow-sm">
          <h4 className="text-2xl font-bold text-indigo-800 dark:text-indigo-300 mb-4">
            Directorio Telefónico Institucional
          </h4>
          <p className="text-indigo-600 dark:text-indigo-200 mb-6 max-w-xl mx-auto">
            Consulta el directorio completo de extensiones y correos de las diferentes áreas, coordinaciones y dependencias del Centro de Tecnología de la Manufactura Avanzada.
          </p>
          <a 
            href="https://docs.google.com/spreadsheets/d/18v6ufbi_YUbVBCqa1mf0eJCA6FWG8IlN/edit?usp=sharing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <ExternalLink className="w-5 h-5 mr-3" />
            Abrir Directorio en Excel
          </a>
        </div>
      </div>
    )
  },
  "siga": {
    title: "Sistema Integrado de Gestión y Autocontrol (SIGA)",
    content: (
      <div className="space-y-8">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-center mb-8 max-w-2xl mx-auto">
          Conoce nuestras políticas institucionales orientadas a garantizar la excelencia, calidad y seguridad en todos nuestros procesos.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
            <ImageZoom 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiqIsZA6JQ-ULIRJUpCrvOQ1EoCQOUY4YyIO8j6uOTJTvmKJFOHuVvnO-TzyOZAiSEb-FDLw0O_LSz7LCOzb9er6RbL_KFzPYG0_lnDNrGZjhwn4WyhNSUncv3LUZSMnmLhDtdSIxPVXuij7GdvddcImR6extb18_b8KyX4gbAbGPElDNkFi89av9J4Jhcx/s0/Politica_SST.png" 
              alt="Política SST"
              className="relative rounded-xl shadow-md w-full h-auto transform transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
            <ImageZoom 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgHrRoULLJOOUqiF45k7kKpGDEIhWaYKa56crrgcwr_2FvcOYiaX1wP5uED7v8yDHLB21SweDXPuVtdIIbp4N12AZyb6Oe0xLF-iKPOx15ahmSaxxZFqyrPmpcAsUzSqISgFxsjf7bwvadUPDtJiYxvcJDb2VR3HXWfuM5nS-3tTdQwZESUs5QNMtXSIbVf/s0/Politica_Seguridad_de_la_Info.png" 
              alt="Política Seguridad de la Información"
              className="relative rounded-xl shadow-md w-full h-auto transform transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
            <ImageZoom 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhCk5mDxb_mSwNhELFMuiTwIWheta7c3IYDXVKsnhR3k29D2Nb8wa6EqRYJc3hOFAUnpjiR6AxclpPFl7fUXzYEpe5bTSMURPTsICmco1DWtfsrs_Sq0WKFLZRP8C_7E7xS_NAP6CLFE2qmVEJdAbxE_SSfxSXInRojTnsMzLrsp6uXWe0K21fKaYeUHt05/s0/Politica_Gestion_de_Calidad.png" 
              alt="Política de Gestión de Calidad"
              className="relative rounded-xl shadow-md w-full h-auto transform transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
            <ImageZoom 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjxLUJkJ6MecCvEs38Aa4FolA1mFzmEDPOUMlQBAMsgTvKE8T5fa3yu40JS_pEIjF5rQDZwNGxXch86eyC8fdaxA36VeMpo80Bs0mOAoGN-fkfS5XTF1Ak1tYmLVJ2X9THA7jCFsYxcNFvfefuaWE6o2d3bQ3pB1Y9ZXaiqIAXMfy26FvomwnDZvzmxvP5t/s0/Politica_control_interno.png" 
              alt="Política de Control Interno"
              className="relative rounded-xl shadow-md w-full h-auto transform transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    )
  },
  "historia": {
    title: "Historia del CTMA",
    content: (
      <>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          El 26 de agosto de 1961 abrió sus puertas el Centro de Aprendizaje de Artes Metalmecánicas en Antioquia, para brindar formación a la comunidad en programas relacionados con máquinas y herramientas como: ebanistería, electricidad, instalador, mantenimiento mecánico, soldadura de soplete y reparador de automotores. Años más tarde, recibió el nombre de Centro Metalmecánico, y en 2007 se consolidó finalmente con el nombre, Centro de Tecnología de la Manufactura Avanzada, como se conoce actualmente.
        </p>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Con la asistencia del entonces presidente de Colombia, Alberto Lleras Camargo, El SENA en sus primeros años se enfocó en la formación de las personas que trabajaban en la industria, comercio, agricultura, minería y ganadería. Paulatinamente fue ampliando su oferta y, como resultado de esa expansión, se creó el Centro de Tecnología de la Manufactura Avanzada (CTMA).
        </p>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Este centro nació para satisfacer las necesidades del sector productivo del país, y para responder a los cambios que se han presentado en los últimos años con la llegada de la Cuarta Revolución Industrial, dando apertura a programas orientados a la cualificación del talento humano que requieren los talleres automotrices, las empresas constructoras y las compañías textiles.
        </p>
      </>
    )
  },
  "bienestar-al-aprendiz": {
    title: "Bienestar al Aprendiz",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full w-full mx-auto py-8">
        
        {/* Card 1: Sala de Atención */}
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
            Sala de Atención Virtual
          </h4>
          <a 
            href="https://teams.microsoft.com/dl/launcher/launcher.html?url=%2F_%23%2Fl%2Fmeetup-join%2F19%3Ameeting_MWFmNDllYmQtMDY0OS00YmJlLWFjNTgtNjUxM2NlMzgwMzRm%40thread.v2%2F0%3Fcontext%3D%257b%2522Tid%2522%253a%2522cbc2c381-2f2e-4d93-91d1-506c9316ace7%2522%252c%2522Oid%2522%253a%2522fa1a60b6-f78d-4dd8-b766-fade5cf00b7e%2522%257d%26anon%3Dtrue&type=meetup-join&deeplinkId=e99cc9cb-ffb4-458f-b575-7e71645c2e58&directDl=true&msLaunch=true&enableMobilePage=true&suppressPrompt=true"
            target="_blank"
            rel="noopener noreferrer"
            className="block relative group transition-transform duration-500 hover:scale-[1.02] cursor-pointer mt-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEikW5WdWtsVh4MRdYi_t5XprXRfQfVrB1UjODpJWpPXaEM2VET-bUPRtEOVsvmDupdN1TSb8ZImjNjlID2O7rSfUFFE2-iWxh3Mk9qVHkO7GcCiQJQkgt53fMS2xItmoJn06w4SidSYY-Hsi5koWtUpiPnhyUf7_gdPTyU8tQnY7jnJzUelv9YJNLggqBjf/s0/%C2%BFQu%C3%A9%20es%20la%20Etapa%20Productiva.jpg" 
              alt="Entrar a reunión de Teams"
              className="relative rounded-xl shadow-lg w-full bg-white p-2"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 rounded-xl">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-xl flex items-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Entrar a la Sala
              </div>
            </div>
          </a>
        </div>

        {/* Card 2: Actividades Programadas */}
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
            Actividades Programadas
          </h4>
          <div className="mt-auto [&>div]:mt-0">
            <GalleryTrigger 
              coverImage="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgrVv0yJn32GZcyDDTAdb4g9uK6ojh2On3yUB-2Go1YB92_T8O9ANXL1eUsiPjCT25ootVgKAMkiNDojDP5KJ4Yv6VodYeTrowSd9gWD_8WWglnDgUQX5bWzQjO5w0HSfQx5K3FTsehdHMkKjAKb1pWqQ5Dzx3NEtkZO8AcRgOA9tnwdjJ5CxvHB-HVOY7_/s0/%C2%BFQu%C3%A9%20es%20la%20Etapa%20Productiva(2).jpg"
              title="Actividades Programadas"
              images={[
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjPkuj2j3-lt6B6kZI_H07wU35RB76HjJgS7NcUnNMzZZpnW6CG2Dt2xW2yWWhr57qfnhvGnNO2KBl3tfv8OTF6jpC-OJZ3hfPOZsg0HuC9RgtD-_rubV75JRZ_HD3ubfu1ZwLkTL6R1E2hUjFooOd0y9okPTKXRTorhILyA4JiA-6zS3xpHlWAxtCELNpZ/s0/MUNDIALITO%20(1).jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhiJFzjhNUA18oJ22GflCmZxEN8tfvOT4d6XomKc9jWE7iLubQGjhiLFWxUYuZTKgDxh8f_m-BrLi0Rw_HM40cgeT_-Y3JnImcoiT1llj3XvEp6eP2jQAw1cZGJa5G1oO2D_h-wMkVaYEjtF5AKZQ-_A1syPFf1FFOFiQN0Q06hFJkIPEa9kAafSBmZ29X2/s0/Subject.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi_OdJ_mkZfyFSQB1MzQlkk3WmCpUmP4nl1ROIXlIP08bum9xheXF1XKd7xBcFzhqj6v4jCsooJVghE1A9lBIERUwkJbUvxHBowvQwwmjLVD-OlD5B9T8RHxrKiY2UUKUQWTCa79eyhof5Js2AS6nK7IrDrpDDU47-RaItLaZWJILLyp38isXLrav-EVmKk/s0/post%20mujer.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg9xtqNMXwR0GS180AN_vso1haAO4dZc_P4ePcbSBLZJEbBgG2xVbR9hN-LE_Vs5uFeJ3xqKgvwBUPfj4oAUB-FXrje69UsNQc5AcVQorgujo8zqAKLRvTogwqdLajO2uAqYS5SQh8pE9_8eD9hoQkh7X2SZDn_QAzSS2uwM68a7ZQfEEcuHGMZn4tYOKxO/s0/feria%20de%20emprendimiento.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfLkQsqYnB2GAHo_eNOcBWgphPVE93S7U2dQ9mW_Yc33bn-2d7hyphenhyphenRRNWm4bY9ggNJgr6wYjMC8ohehQavfyBbf15egQJcy9QwQWF0SelG4UWaBNmnDAL20zQfxdjYMi0-IOfVoJ7AoNI8EeBsamOegftLstICmOLN0x6k9y3RzJtpo0sZdm9oUED6Tyf-c/s0/jornada%20de%20vacunaci%C3%B3n%20.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjxBjDacJzUTgGJAs-BdVJzxZ3c3xB7w9YsniqDjN_mwe-iAMSjV3jMeneFlcH1FuPaQXZyBck7fBiyQAXcTgDlfk0kWM65Rb0stJE4hwRx3TzBSr5Naj63pIUdaqF4ZxsCunJtTbLVZJ5iM4oIVW4Fl2J0ZGRt03xEA_LRWcaaS0KDrwV0hhwIpt_hyNO5/s0/diviertete.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj9v3h3cRsnMWC963zKwE2mL1N1A0XJxj8dRuUdB0dVlplSy86pWeQZ91XmowUL30DL7PUHqJ31uXKASW_Kf_2hq1ugRFUmm1CosIm-E4tSNEE9H1iBLmk1uQEn20hLueGLLSYEWOHfsyHZDLDQnOiFVf32zi0C3ayOCazb6XMMIfJU18XNMIlUm-8e8v6K/s0/semillero%20de%20danza%20bienestar.jpg"
              ]}
            />
          </div>
        </div>

        {/* Card 3: Convocatorias Vigentes */}
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
            Convocatorias Vigentes
          </h4>
          <div className="mt-auto [&>div]:mt-0">
            <GalleryTrigger 
              coverImage="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhnr5z-fFY2KAf6u33XUEVO9exs3WUP9E5vEyGtReUppaTI-T_6sWio0EaUtL1tzV_y9Vu9ht4HLUv3y24emB57DEuQkx_vl7wxTk4QMpN_JMUTnTFJua-CmzxSFRVCR8bns5o5V4aouFZXyxjH3PHstcDcMVSJWDFxmFBAY1a9yq24oDrO6rqfRTF30ndW/s0/%C2%BFQu%C3%A9%20es%20la%20Etapa%20Productiva(1).jpg"
              title="Convocatorias Vigentes"
              images={[
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhi8pRmeAVAcFMYmq3z6LsVW5x0FHeaWbQLtQHiQqCO_fkH-12FG64tZ1HnepleQTfUYvZMqY6Amz1oeERgKPYHJjJZIYEXGY6eryKI9SOK45LISKy06yEd9X61-lrFYHKCd3XVyeWfrs8cBMTEyt_1F3wtSnCIUkRvLPt0x-qi4Y00QzRcUZymKS3imzbv/s0/CONVOCATORIA_2026.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgE8Ic1eu8cP4YqWeW8VneUcjGC9Hsq6KFmr4MSuTlMKRUVQtR-jheO179pokcdBXkuGryIW7gskg5yJxVk3-PDKJL_kL8ctXfyBt3W2IQjLx9NKNq6H6uqqTffQy8TGPUdufSs-0Wqw-u-7sGsJ9z4iwtw1j0WftrfFTfh8NrrvSxAGTA6R66RMRx8Gs_R/s0/Del%2029%20de%20enero%20al%204%20de%20febrero.jpg"
              ]}
            />
          </div>
        </div>

        {/* Card 4: Servicios */}
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
            Servicios y Póliza
          </h4>
          <div className="mt-auto [&>div]:mt-0">
            <GalleryTrigger 
              coverImage="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgoMShYNvdJlBW8q36TLsv-6t68n2VBcRyksI2MM3zoW3BcKpEoHi2INGz2Y1hle2o-3_tKkQeZH-WcRUxw-dUlGF1O57-frXO9KUaoddgIulnN_0CtsVMwVP9pXlWMkZ8Pu_CUWFxA0gDK9GQVdNQ7uSxxPLKNwSJ_nPWVqLZVIQtVz9t7_M5s03E6FZIv/s0/%C2%BFQu%C3%A9%20es%20la%20Etapa%20Productiva(3).jpg"
              title="Servicios y Póliza"
              images={[
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgpALoSvl0MT3imG5AC-2yZ7ko2qg9ZMvFIVJqTYldWloAfpD_OlJ-ra0tavfHuDh_p0KhdSA23EZO5fdUFJd8x8R_6HDgOJw-0kRAgSODDz0HtSKUyfnUv_-v8tRDDt_sEPjRqjPlnt9cZjIvoDPyqIckJJlD2MWsCxg7sc1beQIQ2KegogvH1-O8R_WDJ/s0/p%C3%B3liza.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhz35CBWkoKxNS-NOjoU-8HVv-g_ZMzN0bsOHLq5T-F2AJPhsrqcrwtICNXi37zz_HbR1JrHqrZhoZDtS9SKxH36oeYm520WsWynLyjk4NEVvv53ThjgjESWwiaVGsr--rI5BG3fJeyXIC-DymTyzp9Mgm9ScqUmMAJC3QDN8_pw7NUb-vr0GsRIHR0/s0/Bienestar_pages-to-jpg-0011.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgYBi3ZBIB8rV3u2tm-svrmwr27g5H4b13Gxz3j6x6C9r23aoDP-F-jHzTVnD4WMaqa32pKaxyheCsEcp7HYj_G5nyJMozwAarOu2crCHJkdOx7xKq-HAZABxh6J1FFWvzMdrCPaXDnWd1cuaasPbAxxxnNQTdVVfya3tUwsxabVDuVr_dYaGBaaNAb/s0/Bienestar_pages-to-jpg-0008.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgoTfWRY-gNaxCOKb0aixkixutrNg8aOoBsZDWF-HFI-1SbI9wPNNzAFtidNuk_kX-xN_inzYpaFtdZtZL7BiFL07DdrMN-Er0Uoctg_ytcZEIS0Jdyd4DIW0BsA-vq9Q9IUmJpoj_bvtNQbERAq8PrL4-B8Sfzv9IGe6TSUE_PUtjVjAWNvI57gbwm/s0/Bienestar_pages-to-jpg-0013.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjJv9EF7haZl5UXW4ISt58gyBkbzWV_GVvauwkFKI743mwFvCwk_mmROORVM4Y9_4rX6s3xVOtoBmLawPum7inJecU6_oaIL7ZQyq5U7lEkALEU4Ts6Kc796g1dNQoVhQZOPhcdjSKYsMO_bFbysmqZGtYaKvVG-SVtmJpjrG_yxukwzlYY8c_ygBYy/s0/Bienestar_pages-to-jpg-0014.jpg"
              ]}
              extraContent={
                <a 
                  href="https://drive.google.com/file/d/1tBg5wR9WrlJ4wjP8tacVoz9Mm2lsDZ5c/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-full font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <ExternalLink className="w-5 h-5 mr-3" />
                  Ver Documento Completo de la Póliza (PDF)
                </a>
              }
            />
          </div>
        </div>

        {/* Card 5: Documentos de Interés */}
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
            Documentos de Interés
          </h4>
          <a 
            href="https://drive.google.com/file/d/1pdE7BQPvLqC-DEgkT3Q4Cjbl2upeJ5OV/view" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block relative group cursor-pointer w-full mx-auto mt-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjh7lHv0sRXyh122YogsRbaUkftzYpFdugGNjDA0df1Xv1D_NOBNck4G7Ea79y7n-uvPUqG0qgC4tm6nayPqw0aYWZH-j7xiSoyDwZKF9R4pFsLEFAsGItdAIsDsshVCBl8awIY4DACYT2_dVpBf1-Ojgb9Bm8uLtCSQKEKEiRLqP7XY0HKKPaaeGNqhgnD/s0/%C2%BFQu%C3%A9%20es%20la%20Etapa%20Productiva(4).jpg" 
              alt="Documentos de Interés" 
              className="relative rounded-xl shadow-lg w-full bg-white p-2" 
              loading="lazy" 
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 rounded-xl">
              <div className="bg-pink-600 text-white px-4 py-2 rounded-full font-bold shadow-xl flex items-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-sm text-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Documento
              </div>
            </div>
          </a>
        </div>

        {/* Card 6: Información Adicional */}
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
            Más Información
          </h4>
          <div className="mt-auto [&>div]:mt-0">
            <GalleryTrigger 
              coverImage="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiJi0-KPjeSYTOaStRi01yk8eRdz720agccAabsKUEnWy_bOriNGnYhsKJJA_UX7QskTc2SFOINgOi06FXC01pFlXQe5l-j1c-QpGD_s50hlnVUfeV-nJaRWfV1McJZMRMfaeiGnYdwKcsUMZnGk883Q6egVDeSzLKZHgCby76kwK6SSqRVtVJo2w3BXeS4/s0/%C2%BFQu%C3%A9%20es%20la%20Etapa%20Productiva(5).jpg"
              title="Información Adicional de Bienestar"
              images={[
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgS9U_FWP-rNQ3cGKJvh_6diND-yCF2y5hubI1JkedZgDjmpdN4B0JDlpP1cjd6bWjzLBlAZ8wRyH33u6SZ5hTFXQXIOZgtr-U0ainEI-n8hHpspRVo81O4mpeqnnBDmIrSW5Dy1l0UEd6lnV4VvD6bWu0XfDWh7J4oYWjRAhndLgNCyf_tAkYcwSWV/s0/Bienestar_pages-to-jpg-0003.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQUr2dF9fy4Te3ZqMx_CNqT1oi8tLXgTyl0lTcKp72Gymv6J9wICdjcCIaElNk_ZSZEnGr85orMuc6OKvyFaSH9KkoSoesI7rhBYcLA_Vt-TaMphBfjlaraLRYfYXKci_kVy33kFNUL4xgJfyFcFOJlmGW-Hz-FBPUbHnKvElPxH0bOC3m4_e4MtKV/s0/Bienestar_pages-to-jpg-0004.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgeYaSl7G9Kmey8eOpXATLyY4qMacpRRR4Cu0tV4e7zVT2MHCw6lAa661aL3rfQ_UZUpIUdHtycU2hZ0jgeEYJLB1M1x6ND3n7ugTtJaAv3Vajv1FIyraHClKyzydIsUtCSkx8pSVy3AS0D4WHlwDXLPk0ZIV6gK1qWNmaSFAZPR2ZaBLq9GwhfuGpT/s0/Bienestar_pages-to-jpg-0005.jpg",
                "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEixjoJSbftMaLECa_N7fz1ADm8SVY8FdRBjdmyK2hHoBzMDJizYxAY6oYEyBIeoaNxnBY7gg35lQbSL7TwSXwaZnf2AWCF-wd6eav4x_3_xk6-FarXwgMA6vtk3qiZWubL9UhJOzvFjA8nz78W0kNiOCBcEDlxWXd2bnVCUSHx4l0yJHcNDdGrVk8nC/s0/Bienestar_pages-to-jpg-0006.jpg"
              ]}
              buttonText="Ver 4 Imágenes"
            />
          </div>
        </div>
      </div>
    )
  },
  "etapa-productiva": {
    title: "Etapa Productiva",
    content: (
      <div className="w-full flex flex-col items-center">
        <div className="mb-8 max-w-4xl text-center">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            La etapa productiva es el periodo en el cual el aprendiz SENA aplica, complementa, fortalece y consolida sus competencias en términos de conocimiento, habilidades, destrezas, actitudes y valores, resolviendo problemas reales del sector productivo.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 w-full w-full mx-auto py-8">
          
          {/* Card 1 */}
          <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
              ¿Qué es la Etapa Productiva?
            </h4>
            <div className="mt-auto [&>div]:mt-0">
              <GalleryTrigger 
                coverImage="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEikhCcRFQo2D2F91VA-MTkPBzQcpRlGdQkhmJW_qjUr1mV3wtsImXnWf_zxbd7Mfn3hK8wEfBN9SmF3jG_3NLFDJwJeFVAOaV-GWP77HB-7L0-RvU4SMUHxOyoXoYC__nsdsEzRsQ56reR1uilJwVCAE7QoVAy-N1YsMXaCLXnJXL3tuXFNN5yNJxwguwyj/s0/%C2%BFQu%C3%A9%20es%20la%20Etapa%20Productiva.jpg"
                title="¿Qué es la Etapa Productiva?"
                images={[]}
                buttonText="Pendiente"
              />
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
              Opción 1
            </h4>
            <div className="mt-auto [&>div]:mt-0">
              <GalleryTrigger 
                coverImage="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh9zAXM4dKpBv3qUZ3vs6kAoHoZmeijqex_1vSBMCru6fo86RxMKlB8JAKagCtxIPDL2LXBlrC4F5__wUHWayqX64Tv1HxYHiZH_Cy6hzGAkEIWmVsExb7sLnMzUs4IxL4hKnyI-nSdm8xOoyU0VeqvyUS_FtI4FgR2-Zq-OZ1f-KQeovofq1gyBwA08ynP/s0/1.jpg"
                title="Opción 1"
                images={[]}
                buttonText="Pendiente"
              />
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
              Opción 2
            </h4>
            <div className="mt-auto [&>div]:mt-0">
              <GalleryTrigger 
                coverImage="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj-Mdqgj9juqsc3asksn2O_Rlq_WOhdNIuXfWkwULZHRFbh_d2R4FRYsDmm0oRcIGqPqEJeFHDNtIi8x1nCnndr7FAMvfxzQfleArWH4SO2h_gckxWbOXUzDSdh0_tUTw9wk8z-VoOyvzX6QZaExsPuanaNYmvIUm0y8tNbKPxgWkMIv8htnvRx9AOz6aY-/s0/2.jpg"
                title="Opción 2"
                images={[]}
                buttonText="Pendiente"
              />
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
              Opción 3
            </h4>
            <div className="mt-auto [&>div]:mt-0">
              <GalleryTrigger 
                coverImage="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgl1grKI6zy-RLqJYxzhsamHEXu1nZtKnCE68rUNIK_ktM6cvUzjJEiulDh7MOR6vMBSxEvpRRn3-UmjGNgOKmlwSs-pvzU-YpQ2_WlbwcwOH1h_-opyCNJ6c8EGwUYspoUyy1aTC78nB1XS_lCEi2LniRGVGlmldMzuoXf1HxNxZU8wZE20uJqp2C1LFQL/s0/3.jpg"
                title="Opción 3"
                images={[]}
                buttonText="Pendiente"
              />
            </div>
          </div>

          {/* Card 5 */}
          <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
              Opción 4
            </h4>
            <div className="mt-auto [&>div]:mt-0">
              <GalleryTrigger 
                coverImage="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgaH-tToszQeBuAtpQ5lAen2tQ_rD0zX5V2P65jsBH0hTTWupYsXwjBcGmX2zLev6WCQ2KqYr7WmVRjkuKVg_PUijcfZqqc28cIcfqg1I3pGh6FZJunu3WNOansxwDa_KHJjkKE2GBpWWMzDuuO5Qgs8PRDvMdnNs7HMXeCrr8njUnYduWdEHbsnf8csBfR/s0/4.jpg"
                title="Opción 4"
                images={[]}
                buttonText="Pendiente"
              />
            </div>
          </div>

          {/* Card 6 */}
          <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
              Opción 5
            </h4>
            <div className="mt-auto [&>div]:mt-0">
              <GalleryTrigger 
                coverImage="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjHJMtzwh-VT5Tv0P8ATw0vX4zY28I-6Mm8SykSgg4RgHjf7O9MAUe5c30Ll4w74jXVCeTMY1SGetbWXVP-v190KvI4OIkKACSLDflrkf2giSIRTUf3ljSG8UZV5STFYSko7jK1lVtXiuCNkvpK6U3zcCzgR50Fo5I93cYiMdf1LWENwTfcoK0CdkHMDuVU/s0/5.jpg"
                title="Opción 5"
                images={[]}
                buttonText="Pendiente"
              />
            </div>
          </div>

          {/* Card 7 */}
          <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
              Opción 6
            </h4>
            <div className="mt-auto [&>div]:mt-0">
              <GalleryTrigger 
                coverImage="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh2WuHMlkIcU9IoA_IiKEVYpynEbXX6dJsfa3vzGAM-Ez9MvCYBsbfuMLHrk6aQMg1q2Ekp3QlM6O1L_gnHsJeiZYTQdmnNomzlAbhZGtfwHc-HmqEBb1DDE8bc1gberS5u1372z-RJk1-xOcT_rk-QCwTNN1jIOK06DSDHSqtgxf6y4YB5c3qCi3oYoPSO/s0/6.jpg"
                title="Opción 6"
                images={[]}
                buttonText="Pendiente"
              />
            </div>
          </div>

          {/* Card 8 */}
          <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 text-center min-h-[56px] flex items-center justify-center">
              Opción 7
            </h4>
            <div className="mt-auto [&>div]:mt-0">
              <GalleryTrigger 
                coverImage="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiJHQUQUDijxqocsy3mbhqSqwug_g3Oj-WI8MlKSrtU48vu9cyHM1B8Q3_z-Hvpjjfdr3dZx3quHob_eiNumRqtnaKX5XcAO9aSbrWswGum2Fdv6ZR2GA3ZP6FPDcMD9DhpDgaZHGrwZnsrgxLdgVBhMDuCN9zKtCKF_d-qSBTdPe4ZFNpV_gCvUlt8u035/s0/7.jpg"
                title="Opción 7"
                images={[]}
                buttonText="Pendiente"
              />
            </div>
          </div>

        </div>
      </div>
    )
  },
  "biblioteca": {
    title: "Sistema de Bibliotecas (SBS)",
    content: (
      <>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          El Sistema de Bibliotecas SENA (SBS) brinda los recursos bibliográficos, el talento humano y la infraestructura física y tecnológica necesarios para apoyar el desarrollo de los programas de formación.
        </p>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
          <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">Servicios Ofertados:</h4>
          <ul className="list-disc pl-5 space-y-1 text-indigo-700 dark:text-indigo-200 text-sm">
            <li>Préstamo externo e interno de libros físicos.</li>
            <li>Bases de datos digitales especializadas (e-books, revistas, artículos).</li>
            <li>Orientación y capacitación en el uso de herramientas de búsqueda.</li>
            <li>Salas de lectura y equipos de consulta.</li>
          </ul>
        </div>
      </>
    )
  }
};

export default async function CtmaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const pageData = pageContent[slug] || {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
    content: (
      <div className="py-8 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-4">
          Esta sección del CTMA está en proceso de migración de contenido.
        </p>
        <div className="inline-block p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Puedes encontrar la información temporalmente en la base documental del centro o comunicándote directamente con el área encargada.
          </p>
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex flex-col items-center">
      
      {/* Fondo Decorativo Grid y Glows MUY VISIBLES */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Patrón de puntos (Grid Pattern) más oscuro y visible */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_2px,transparent_2px)] dark:bg-[radial-gradient(#475569_2px,transparent_2px)] [background-size:32px_32px] opacity-100 dark:opacity-80"></div>
        
        {/* Gradientes ambientales gigantes y coloridos (Mesh Gradient) */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/40 dark:bg-indigo-600/30 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400/40 dark:bg-blue-600/30 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-purple-400/30 dark:bg-purple-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      <div className="w-full relative z-10">
        {/* BOTÓN DE VOLVER MEJORADO */}
        <Link 
          href="/?guest=true" 
          className="group inline-flex items-center px-6 py-3 mb-10 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-full shadow-md hover:shadow-xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-900/30 hover:-translate-y-1 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200 dark:border-slate-700"
        >
          <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
          Volver a la plataforma
        </Link>
        
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden transform transition-all hover:shadow-indigo-500/10 duration-700">
          
          {/* Cabecera del Documento */}
          <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-indigo-900 px-10 py-16 text-white relative overflow-hidden group">
            {/* Patrón CSS Puro (Líneas Diagonales) Muy Visible */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 2px, transparent 0, transparent 50%)', backgroundSize: '24px 24px' }}></div>
            
            {/* Figuras geométricas brillantes para darle más vida */}
            <div className="absolute -top-32 -right-32 bg-cyan-400/40 w-96 h-96 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="absolute -bottom-32 -left-32 bg-purple-500/40 w-96 h-96 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000 delay-100"></div>
            
            <div className="absolute top-8 right-12 opacity-20 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
              <Info className="w-40 h-40" />
            </div>
            
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-semibold tracking-wider uppercase mb-4 backdrop-blur-md border border-white/30 shadow-sm">
                Información Institucional
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4 drop-shadow-md">
                {pageData.title}
              </h1>
              <div className="w-20 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mb-4"></div>
              <p className="text-indigo-100 font-medium text-lg drop-shadow-sm">
                Centro de Tecnología de la Manufactura Avanzada (CTMA)
              </p>
            </div>
          </div>
          
          {/* Contenido */}
          <div className="p-10 md:p-14 bg-white/50 dark:bg-slate-800/50 relative">
            <div className="absolute top-0 left-10 w-px h-full bg-gradient-to-b from-indigo-500/20 to-transparent hidden md:block"></div>
            
            <div className="prose dark:prose-invert prose-slate prose-lg md:prose-xl max-w-none relative z-10 md:pl-8">
              {pageData.content}
            </div>
            
            {/* Elemento Decorativo Final */}
            <div className="mt-16 flex items-center justify-center space-x-2 opacity-50">
              <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
