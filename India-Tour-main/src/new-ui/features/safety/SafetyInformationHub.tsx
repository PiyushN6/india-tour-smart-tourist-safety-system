import React from 'react'
import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'
import Navbar from '@/components/Navbar'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const SafetyInformationHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
      <Navbar />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light">
          <div className="absolute -right-24 top-24 h-64 w-64 rounded-full bg-gradient-to-br from-primary-royal-blue/8 via-sky-400/10 to-transparent blur-3xl" />
          <div className="absolute -left-32 bottom-10 h-72 w-72 rounded-full bg-gradient-to-tr from-primary-saffron/12 via-orange-400/10 to-transparent blur-3xl" />
        </div>

        <section className="relative mb-8 sm:mb-10">
          <motion.div
            className="text-center space-y-4"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] tracking-[0.16em] uppercase text-slate-500 shadow-sm">
              <span className="font-semibold">Travel safety, made human</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-[2.55rem] font-semibold text-slate-900">
                Safety Information Hub
              </h1>
              <div className="flex items-center justify-center gap-3 text-[11px] sm:text-xs text-slate-500 uppercase tracking-[0.2em]">
                <span className="h-px w-10 bg-gradient-to-r from-transparent via-slate-300 to-slate-200" />
                <span>Plan · Move · Respond</span>
                <span className="h-px w-10 bg-gradient-to-l from-transparent via-slate-300 to-slate-200" />
              </div>
            </div>
            <p className="max-w-3xl mx-auto text-sm sm:text-[15px] text-slate-600">
              Everything you need to feel prepared in India – from pre-trip checklists and cultural etiquette
              to health tips, scams to avoid, and clear steps to follow if something doesn&apos;t feel right.
            </p>
          </motion.div>
        </section>

        {/* Vertical journey line (desktop only) */}
        <div className="pointer-events-none hidden lg:block absolute left-6 top-[30rem] bottom-16">
          {/* Journey line itself, starting and ending at the first and last markers */}
          <div className="absolute top-[4.3%] bottom-[9.8%] left-0 w-[3px] bg-gradient-to-b from-sky-400 via-slate-500 to-orange-400 rounded-full" />
          {/* 1. Before you travel */}
          <div className="absolute -left-[6px] top-[4.3%] h-3 w-3 rounded-full border-2 border-sky-300 bg-white shadow-md" />
          {/* 2. Transport & getting around */}
          <div className="absolute -left-[6px] top-[19%] h-3 w-3 rounded-full border-2 border-indigo-400 bg-white shadow-md" />
          {/* 3. Solo & solo female travel */}
          <div className="absolute -left-[6px] top-[39.9%] h-3 w-3 rounded-full border-2 border-amber-400 bg-white shadow-md" />
          {/* 4. Cultural etiquette / Health band */}
          <div className="absolute -left-[6px] top-[59.8%] h-3 w-3 rounded-full border-2 border-indigo-400 bg-white shadow-md" />
          {/* 5. Health, food & water band */}
          <div className="absolute -left-[6px] top-[75.8%] h-3 w-3 rounded-full border-2 border-emerald-400 bg-white shadow-md" />
          {/* 6. Quick emergency numbers in India */}
          <div className="absolute -left-[6px] top-[90.2%] h-3 w-3 rounded-full border-2 border-red-400 bg-white shadow-md" />
        </div>

        {/* Hero 3D-style safety summary card */}
        <section className="relative mb-10 sm:mb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] items-center"
          >
            <div className="relative h-52 sm:h-56 md:h-60">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-royal-blue/10 via-sky-300/10 to-orange-300/10 blur-3xl" />
              <div className="relative h-full w-full flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute -top-6 -left-4 right-4 h-28 rounded-3xl bg-orange-50 border border-slate-100 shadow-[0_22px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transform-gpu -rotate-3" />
                  <div className="absolute -bottom-5 left-6 right-0 h-28 rounded-3xl bg-emerald-50 border border-slate-100 shadow-[0_22px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl transform-gpu rotate-2" />
                  <div className="relative rounded-3xl bg-white border border-sky-100 shadow-[0_26px_80px_rgba(15,23,42,0.16)] px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Your safety snapshot</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs text-slate-700">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-900 mb-1">Before</p>
                        <p className="text-[11px] text-slate-600">Itinerary, copies, insurance, contacts ready.</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-900 mb-1">During</p>
                        <p className="text-[11px] text-slate-600">Aware in crowds, smart transport, healthy habits.</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-900 mb-1">If unsure</p>
                        <p className="text-[11px] text-slate-600">Move to light, call 112, ask for help early.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-left max-w-md lg:max-w-sm lg:ml-auto">
              <p className="text-xs sm:text-[13px] text-slate-600">
                Think of this page as your quick safety dashboard – from the moment you start planning, to
                how you move around, to what to do if something doesn&apos;t feel right.
              </p>
              <p className="text-xs sm:text-[13px] text-slate-600">
                You don&apos;t have to remember everything at once. Scroll through the bands, pause where you
                need, and let them guide your decisions as you travel.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Core safety band */}
        <section className="relative mb-12 sm:mb-14">
          <motion.div
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            {/* Before travel */}
            <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-sky-50 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(15,23,42,0.16)]">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                  Before you travel
                </h2>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600">
                <li>• Check the latest advisories for regions you plan to visit.</li>
                <li>• Share your itinerary and emergency contact details with someone you trust.</li>
                <li>• Keep digital and printed copies of passport, visa, tickets, and insurance.</li>
                <li>• Talk to your doctor about any recommended vaccines and medicines.</li>
                <li>• Enable international roaming or confirm offline maps for key cities.</li>
                <li>• Talk to your doctor about any recommended vaccines and medicines.</li>
              </ul>
            </div>

            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-emerald-50 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(15,23,42,0.16)]">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                  While you are in India
                </h2>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600">
                <li>• Stay aware of your surroundings in crowded markets, stations, and festivals.</li>
                <li>• Use registered taxis / apps; avoid unofficial offers late at night.</li>
                <li>• Keep valuables close, zipped, and out of sight in busy public areas.</li>
                <li>• Prefer ATMs in banks or malls; shield your PIN and limit large cash withdrawals.</li>
                <li>• Save your hotel, local contacts, and emergency numbers in your phone.</li>
              </ul>
            </div>

            {/* Night-time safety */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-rose-50 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(15,23,42,0.16)]">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                  Night-time safety
                </h2>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600">
                <li>• Prefer well-lit, busier streets; avoid walking alone through isolated shortcuts.</li>
                <li>• Keep your phone charged and share your live location with a trusted contact.</li>
                <li>• Use app-based cabs where you can see the driver and route details.</li>
                <li>• Agree on fares in advance if you must use non-metered transport.</li>
                <li>• Trust your instincts – if a place or ride feels unsafe, change plans.</li>
              </ul>
            </div>

            {/* Transport safety */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-indigo-50 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(15,23,42,0.16)]">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                  Transport & getting around
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-[13px] text-slate-600">
                <ul className="space-y-2 leading-relaxed">
                  <li>• Use official taxi stands, metro, and recognised app-based cabs where possible.</li>
                  <li>• Check vehicle number plates and match them with your booking details.</li>
                  <li>• Keep bags close on buses and trains; avoid placing valuables in overhead racks.</li>
                  <li>• At stations, follow signage and avoid very empty compartments late at night.</li>
                </ul>
                <ul className="space-y-2 leading-relaxed">
                  <li>• When renting a vehicle, wear seatbelts/helmets and avoid night-time highways if tired.</li>
                  <li>• Confirm routes on a map so you know the general direction of travel.</li>
                  <li>• In crowded autos or shared taxis, keep wallets and phones in front pockets or bags.</li>
                  <li>• If you ever feel unsafe, ask the driver to stop in a busy, well-lit area and exit.</li>
                </ul>
              </div>
            </div>

            {/* If something feels wrong */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-amber-50 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(15,23,42,0.16)]">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                  If something feels wrong
                </h2>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600">
                <li>• Move to a brighter, busier place such as a shop, hotel lobby, or metro station.</li>
                <li>• Call 112 for emergency help, or ask a trusted local / staff member to assist.</li>
                <li>• Keep calm, describe the situation clearly, and share your nearest landmark.</li>
                <li>• Contact your embassy/consulate for lost documents or serious incidents.</li>
                <li>• Record key details (time, place, people) as soon as you feel safe.</li>
              </ul>
            </div>
          </motion.div>
        </section>

        {/* Solo & mindful travel band */}
        <section className="relative mb-12 sm:mb-14">
          <motion.div
            className="grid gap-5 lg:gap-6 md:grid-cols-[1.1fr,1.1fr,0.9fr]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            <div className="px-5 py-6 sm:px-7 sm:py-7 rounded-3xl border border-slate-200 bg-amber-50 shadow-[0_26px_80px_rgba(15,23,42,0.14)] transform-gpu transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.01]">
              <div className="flex flex-col gap-1.5 mb-4">
                <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                  Solo & solo female travel
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-600">
                  India can be deeply rewarding for solo travellers – these habits help you stay in
                  control and comfortable, especially when travelling alone.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-[13px] text-slate-700">
                <ul className="space-y-1.5">
                  <li>• Choose well-rated stays (especially with many solo reviews) in central, safer areas.</li>
                  <li>• Avoid sharing your full plans or room details with strangers.</li>
                  <li>• Trust your intuition: you never owe anyone an explanation for leaving a situation.</li>
                  <li>• Keep a small day-bag with essentials so you can move quickly if needed.</li>
                </ul>
                <ul className="space-y-1.5">
                  <li>• In crowded spaces, stand where staff or families are present.</li>
                  <li>• For late returns, let your hotel or a friend know your expected time.</li>
                  <li>• Use app features like ride-sharing details and emergency share when available.</li>
                  <li>• If you feel harassed, move towards staff, security, or families and clearly ask for help.</li>
                </ul>
              </div>
            </div>

            <div className="px-5 py-6 sm:px-6 sm:py-7 rounded-3xl border border-slate-200 bg-sky-50 shadow-[0_22px_70px_rgba(15,23,42,0.11)] transform-gpu transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.01]">
              <div className="flex items-start gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                    Meeting people safely
                  </h2>
                  <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                    New connections are a big part of travel – you can enjoy them with a few boundaries.
                  </p>
                </div>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-[13px] text-slate-700">
                <li>• Meet new people first in public spaces – cafés, hostels, walking tours, workshops.</li>
                <li>• Keep your own drink with you; if in doubt, order a fresh one.</li>
                <li>• Avoid letting strangers handle your phone, wallet, or important documents.</li>
                <li>• Share only the level of personal information you are genuinely comfortable with.</li>
              </ul>
            </div>

            <div className="px-5 py-6 sm:px-6 sm:py-7 rounded-3xl border border-slate-200 bg-emerald-50 shadow-[0_20px_60px_rgba(15,23,42,0.09)] transform-gpu transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.01] flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase mb-3">
                  A quick mental checklist
                </h2>
                <ul className="space-y-1.5 text-xs sm:text-[13px] text-slate-700">
                  <li>• Does someone you trust know broadly where you are today?</li>
                  <li>• Do you know how to get back to your stay (address + location saved)?</li>
                  <li>• Is your phone charged enough, with data or an offline map cached?</li>
                  <li>• If plans change, can you leave or say no without pressure?</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Etiquette & scams band */}
        <section className="relative mb-12 sm:mb-14">
          <motion.div
            className="grid gap-5 md:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            <div className="px-5 py-6 sm:px-7 sm:py-7 rounded-3xl border border-slate-200 bg-indigo-50 shadow-[0_24px_70px_rgba(15,23,42,0.12)] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(15,23,42,0.16)]">
              <div className="flex items-start gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                    Cultural etiquette essentials
                  </h2>
                  <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                    India is warm and welcoming – a little cultural awareness goes a long way in keeping
                    you safe and respectful.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-[13px] text-slate-700">
                <div className="space-y-2.5">
                  <p className="font-semibold text-slate-900">Dress & public spaces</p>
                  <ul className="space-y-1.5">
                    <li>• Dress a bit more conservatively when visiting temples or rural areas.</li>
                    <li>• Remove shoes before entering homes and many religious places.</li>
                    <li>• Ask before photographing people, especially children or worship.</li>
                    <li>• Avoid public displays of affection in traditional spaces.</li>
                  </ul>
                </div>
                <div className="space-y-2.5">
                  <p className="font-semibold text-slate-900">Communication & behavior</p>
                  <ul className="space-y-1.5">
                    <li>• A friendly "Namaste" with a smile is always appreciated.</li>
                    <li>• Use your right hand for giving or receiving money, food, or business cards.</li>
                    <li>• Stay calm in disagreements – raised voices can escalate situations.</li>
                    <li>• Respect local customs around alcohol and late-night noise.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="px-5 py-6 sm:px-6 sm:py-7 rounded-3xl border border-slate-200 bg-rose-50 shadow-[0_22px_60px_rgba(15,23,42,0.09)] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(15,23,42,0.16)]">
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                      Common scams to avoid
                    </h2>
                    <p className="text-xs sm:text-[13px] text-slate-600 mt-1">
                      Most trips are trouble-free, but staying aware of a few patterns protects you.
                    </p>
                  </div>
                </div>
                <ul className="space-y-1.5 text-xs sm:text-[13px] text-slate-700">
                  <li>• "Helpers" at ATMs or ticket counters who insist on pressing buttons for you.</li>
                  <li>• Taxis that refuse the meter and quote a very high flat rate – ask for the meter or use apps.</li>
                  <li>• Shops that claim a monument or attraction is "closed" and redirect you to another place.</li>
                  <li>• Unofficial guides approaching aggressively at popular sights – prefer authorised guides.</li>
                  <li>• Requests to hold bags or valuables for strangers in stations or airports.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Health band */}
        <section className="relative mb-12 sm:mb-14">
          <motion.div
            className="grid gap-5 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            {/* Health, food & water */}
            <div className="px-5 py-6 sm:px-7 sm:py-7 rounded-3xl border border-slate-200 bg-emerald-50 shadow-[0_24px_70px_rgba(15,23,42,0.1)] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(15,23,42,0.16)] text-xs sm:text-[13px] text-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                  Health, food & water
                </h2>
              </div>
              <p className="text-slate-600 mb-2">
                Simple habits reduce the chances of falling sick and keep your trip on track.
              </p>
              <ul className="space-y-1.5">
                <li>• Drink bottled or filtered water; avoid ice if you are unsure of its source.</li>
                <li>• Start with cooked, hot food from busy places; add street food gradually.</li>
                <li>• Carry a small kit with basic medicines for stomach, headaches, and allergies.</li>
                <li>• Protect yourself from heat: light clothing, hat, and regular water breaks.</li>
              </ul>
            </div>

            {/* Medical help */}
            <div className="glass-card rounded-3xl border border-slate-200/90 bg-sky-50 px-5 py-6 sm:px-7 sm:py-7 shadow-[0_24px_70px_rgba(15,23,42,0.1)] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(15,23,42,0.16)] text-xs sm:text-[13px] text-slate-700">
              <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase mb-2">
                Medical help
              </h2>
              <ul className="space-y-1.5">
                <li>• In a serious emergency, call <span className="font-semibold text-emerald-600">112</span>.</li>
                <li>• For non-urgent issues, ask your hotel to recommend a nearby hospital or clinic.</li>
                <li>• Keep your insurance card / policy number handy in your wallet and phone.</li>
              </ul>
            </div>

            {/* Documents & money */}
            <div className="glass-card rounded-3xl border border-slate-200/90 bg-amber-50 px-5 py-6 sm:px-7 sm:py-7 shadow-[0_24px_70px_rgba(15,23,42,0.1)] transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_28px_90px_rgba(15,23,42,0.16)] text-xs sm:text-[13px] text-slate-700">
              <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase mb-2">
                Documents & money
              </h2>
              <ul className="space-y-1.5">
                <li>• Keep your passport in a safe place; carry only a soft copy day-to-day.</li>
                <li>• Split cards and cash between two places (wallet + bag) in case one is lost.</li>
                <li>• Use hotel safes where available; avoid leaving valuables in unlocked rooms.</li>
              </ul>
            </div>
          </motion.div>
        </section>


        <section className="relative mb-10 sm:mb-12">
          <motion.div
            className="grid gap-4 sm:gap-5 md:grid-cols-4 lg:grid-cols-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
          >
            <div className="md:col-span-2 lg:col-span-2 rounded-3xl border border-slate-200 bg-white px-5 py-5 sm:px-6 sm:py-6 shadow-[0_20px_60px_rgba(15,23,42,0.09)] flex flex-col justify-between transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_30px_95px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-5 h-5 text-red-600" />
                <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                  Quick emergency numbers in India
                </h2>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-600 mb-3">
                Save these to your phone before you travel. Availability can vary by region, so your
                hotel or local contacts can confirm what works best where you are.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-[13px]">
                <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5">
                  <div className="text-[11px] font-medium text-red-700 mb-0.5">All emergencies</div>
                  <div className="text-xl font-semibold text-red-700">112</div>
                </div>
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2.5">
                  <div className="text-[11px] font-medium text-sky-700 mb-0.5">Police</div>
                  <div className="text-xl font-semibold text-sky-700">100</div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <div className="text-[11px] font-medium text-emerald-700 mb-0.5">Ambulance</div>
                  <div className="text-xl font-semibold text-emerald-700">108</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 rounded-3xl border border-slate-200 bg-sky-50 px-5 py-4 sm:px-6 sm:py-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] flex flex-col gap-3 transform-gpu transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_30px_95px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                  In case of a serious incident
                </h2>
              </div>
              <ol className="space-y-1.5 text-xs sm:text-[13px] text-slate-700 list-decimal list-inside">
                <li>Move to a safe, well-lit place with other people.</li>
                <li>Call 112 or the most relevant emergency number above.</li>
                <li>Contact your hotel or local host and explain what happened.</li>
                <li>Reach out to your embassy/consulate for legal or documentation support.</li>
                <li>Keep any reports, receipts, and reference numbers for your records.</li>
              </ol>
            </div>
          </motion.div>
        </section>
      </main>

    </div>
  )
}

export default SafetyInformationHub