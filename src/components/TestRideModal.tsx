import React, { useState } from 'react';
import { Motorcycle, TestRideBooking } from '../types';
import { MOTORCYCLES } from '../data/motorcycles';
import { X, Calendar, Clock, CheckCircle2, QrCode, Shield, MapPin, User, Mail, Phone, Sparkles } from 'lucide-react';

interface TestRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBike?: Motorcycle;
}

export const TestRideModal: React.FC<TestRideModalProps> = ({
  isOpen,
  onClose,
  preselectedBike,
}) => {
  const [selectedBikeId, setSelectedBikeId] = useState<string>(
    preselectedBike?.id || MOTORCYCLES[0].id
  );
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [licenseType, setLicenseType] = useState<string>('Patente A (Senza Limiti)');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('10:30');
  const [location, setLocation] = useState<string>('Sede Centrale Roma (Showroom & Pista Prove)');
  const [bookingConfirmed, setBookingConfirmed] = useState<TestRideBooking | null>(null);

  if (!isOpen) return null;

  const currentBike = MOTORCYCLES.find((b) => b.id === selectedBikeId) || MOTORCYCLES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !preferredDate) return;

    const booking: TestRideBooking = {
      fullName,
      email,
      phone,
      bikeId: currentBike.id,
      bikeName: currentBike.name,
      licenseType,
      preferredDate,
      preferredTime,
      dealershipLocation: location,
    };

    setBookingConfirmed(booking);
  };

  const handleResetAndClose = () => {
    setBookingConfirmed(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0f1015] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Chiudi finestra"
        >
          <X className="w-5 h-5" />
        </button>

        {bookingConfirmed ? (
          /* Confirmation Ticket Card */
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#E10600]">
                Prenotazione Confermata
              </span>
              <h3 className="text-2xl font-bold text-white font-display mt-1">
                Pass Test Ride Ufficiale #DF-{Math.floor(100000 + Math.random() * 900000)}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Preparati a salire in sella alla tua <strong className="text-white">{bookingConfirmed.bikeName}</strong>. Abbiamo riservato la moto per te.
              </p>
            </div>

            {/* Ticket Graphic */}
            <div className="p-5 rounded-2xl bg-black/50 border border-white/10 text-left relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#E10600]">Moto Assegnata</span>
                  <div className="text-base font-bold text-white font-display">{bookingConfirmed.bikeName}</div>
                </div>
                <div className="w-12 h-12 bg-white p-1 rounded-lg flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-black" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Pilota:</span>
                  <span className="text-white font-semibold">{bookingConfirmed.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Data & Ora:</span>
                  <span className="text-white font-semibold">{bookingConfirmed.preferredDate} alle {bookingConfirmed.preferredTime}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Location Test:</span>
                  <span className="text-white font-semibold">{bookingConfirmed.dealershipLocation}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-white/15 flex items-center gap-2 text-[11px] text-slate-400">
                <Shield className="w-4 h-4 text-[#E10600] shrink-0" />
                <span>Casco omologato e abbigliamento protettivo obbligatori. Assicurazione Kasko completa inclusa.</span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-3 text-xs font-bold text-white bg-[#E10600] hover:bg-red-700 rounded-xl transition-transform active:scale-95"
            >
              Chiudi & Torna alla Gamma
            </button>
          </div>
        ) : (
          /* Booking Form */
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E10600] font-mono">
                <Sparkles className="w-4 h-4" />
                Esperienza Esclusiva su Strada & Pista
              </div>
              <h3 className="text-2xl font-extrabold text-white font-display uppercase tracking-tight mt-1">
                Prenota il tuo Test Ride
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Prova dal vivo la potenza e l'agilità di guida. Un nostro istruttore ti accompagnerà per scoprire tutte le mappe e l'elettronica.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Select Bike */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Moto Desiderata per il Test:
                </label>
                <select
                  value={selectedBikeId}
                  onChange={(e) => setSelectedBikeId(e.target.value)}
                  className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#E10600]"
                >
                  {MOTORCYCLES.map((bike) => (
                    <option key={bike.id} value={bike.id}>
                      {bike.name} ({bike.categoryLabel} — {bike.specs.powerHp} CV)
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Nome e Cognome:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mario Rossi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#E10600]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Telefono Cellulare:
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+39 340 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#E10600]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email di Contatto:
                </label>
                <input
                  type="email"
                  required
                  placeholder="mario.rossi@example.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#E10600]"
                />
              </div>

              {/* License & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">
                    Tipologia Patente di Guida:
                  </label>
                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value)}
                    className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#E10600]"
                  >
                    <option value="Patente A (Senza Limiti)">Patente A (Senza Limiti)</option>
                    <option value="Patente A2 (Fino a 35 kW)">Patente A2 (Fino a 35 kW)</option>
                    <option value="Patente Estera Internazionale">Patente Estera Internazionale</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Data Desiderata:
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-[#181920] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#E10600]"
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Fascia Oraria Preferita:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['09:30', '11:00', '15:30', '17:30'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setPreferredTime(time)}
                      className={`py-2 text-center rounded-lg border transition-all ${
                        preferredTime === time
                          ? 'bg-[#E10600] border-[#E10600] text-white font-bold'
                          : 'bg-[#181920] border-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold text-white bg-[#E10600] hover:bg-red-700 rounded-xl shadow-lg shadow-red-950/50 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Conferma e Genera Pass Test Ride
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Test gratuito senza obbligo d'acquisto. Durata sessione: circa 45 minuti con briefing tecnico.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
