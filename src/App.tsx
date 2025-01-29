import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Home, User, Check, X, Edit2, Save } from 'lucide-react';

interface Rental {
  id: string;
  property: string;
  checkIn: string;
  checkInTime: string;
  checkOut: string;
  checkOutTime: string;
  cleaningHours: number;
  extras: string[];
  worker?: string;
  completed: boolean;
}

function App() {
  const [rentals, setRentals] = useState<Rental[]>(() => {
    const saved = localStorage.getItem('rentalsData');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newRental, setNewRental] = useState({
    property: '',
    checkIn: '',
    checkInTime: '',
    checkOut: '',
    checkOutTime: '',
    cleaningHours: 0,
    extras: [] as string[],
    worker: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);

  const properties = [
    "Balancon", "Benjamin", "Cliente Emma", "Estrella del mar",
    "La jaquita 2", "La ola apartamento", "La ola estudio",
    "La perla A4", "La perla A11", "La perla C13", "La perla C17",
    "Lagos de miramar", "Lagos de mirazul", "Mar azul", "Marbella"
  ];

  const workers = ["Rosa", "Nicole", "Joan"];

  useEffect(() => {
    localStorage.setItem('rentalsData', JSON.stringify(rentals));
  }, [rentals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rental: Rental = {
      id: Date.now().toString(),
      ...newRental,
      completed: false,
    };
    setRentals([...rentals, rental]);
    setNewRental({
      property: '',
      checkIn: '',
      checkInTime: '',
      checkOut: '',
      checkOutTime: '',
      cleaningHours: 0,
      extras: [],
      worker: '',
    });
  };

  const getUpcomingRentals = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const targetDate = date.toISOString().split('T')[0];
    
    return rentals.filter(
      rental => rental.checkIn === targetDate || rental.checkOut === targetDate
    );
  };

  const toggleComplete = (id: string) => {
    setRentals(rentals.map(rental => 
      rental.id === id ? { ...rental, completed: !rental.completed } : rental
    ));
  };

  const startEditing = (rental: Rental) => {
    setEditingId(rental.id);
    setEditingRental({ ...rental });
  };

  const saveEditing = () => {
    if (editingRental) {
      setRentals(rentals.map(rental => 
        rental.id === editingRental.id ? editingRental : rental
      ));
      setEditingId(null);
      setEditingRental(null);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingRental(null);
  };

  const downloadCSV = () => {
    const headers = "Property,Check-in,Check-in Time,Check-out,Check-out Time,Cleaning Hours,Extras,Worker,Completed\n";
    const csvContent = rentals.map(rental => 
      `${rental.property},${rental.checkIn},${rental.checkInTime},${rental.checkOut},${rental.checkOutTime},${rental.cleaningHours},"${rental.extras.join('; ')}",${rental.worker || ''},${rental.completed}`
    ).join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rentals.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const RentalCard = ({ rental, isEditing }: { rental: Rental, isEditing: boolean }) => {
    if (isEditing && editingRental) {
      return (
        <div className="p-4 rounded-lg bg-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{rental.property}</h3>
            <div className="flex gap-2">
              <button
                onClick={saveEditing}
                className="p-2 rounded-full bg-green-600 hover:bg-green-700"
                title="Guardar cambios"
              >
                <Save size={16} />
              </button>
              <button
                onClick={cancelEditing}
                className="p-2 rounded-full bg-red-600 hover:bg-red-700"
                title="Cancelar edición"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Fecha de Entrada</label>
              <input
                type="date"
                value={editingRental.checkIn}
                onChange={(e) => setEditingRental({ ...editingRental, checkIn: e.target.value })}
                className="w-full bg-gray-600 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Hora de Entrada</label>
              <input
                type="time"
                value={editingRental.checkInTime}
                onChange={(e) => setEditingRental({ ...editingRental, checkInTime: e.target.value })}
                className="w-full bg-gray-600 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Fecha de Salida</label>
              <input
                type="date"
                value={editingRental.checkOut}
                onChange={(e) => setEditingRental({ ...editingRental, checkOut: e.target.value })}
                className="w-full bg-gray-600 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Hora de Salida</label>
              <input
                type="time"
                value={editingRental.checkOutTime}
                onChange={(e) => setEditingRental({ ...editingRental, checkOutTime: e.target.value })}
                className="w-full bg-gray-600 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Horas de Limpieza</label>
              <input
                type="number"
                step="0.5"
                value={editingRental.cleaningHours}
                onChange={(e) => setEditingRental({ ...editingRental, cleaningHours: parseFloat(e.target.value) })}
                className="w-full bg-gray-600 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Trabajador/a</label>
              <select
                value={editingRental.worker || ''}
                onChange={(e) => setEditingRental({ ...editingRental, worker: e.target.value })}
                className="w-full bg-gray-600 rounded p-2"
              >
                <option value="">Asignar trabajador</option>
                {workers.map(worker => (
                  <option key={worker} value={worker}>{worker}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Extras</label>
              <div className="flex gap-4">
                {['Agua', 'Vino', 'Papel'].map(extra => (
                  <label key={extra} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingRental.extras.includes(extra)}
                      onChange={(e) => {
                        const newExtras = e.target.checked
                          ? [...editingRental.extras, extra]
                          : editingRental.extras.filter(item => item !== extra);
                        setEditingRental({ ...editingRental, extras: newExtras });
                      }}
                      className="bg-gray-600 rounded"
                    />
                    {extra}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`p-4 rounded-lg ${rental.completed ? 'bg-green-900' : 'bg-gray-700'}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">{rental.property}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => toggleComplete(rental.id)}
              className={`p-2 rounded-full ${rental.completed ? 'bg-green-700 hover:bg-green-800' : 'bg-gray-600 hover:bg-gray-500'}`}
              title={rental.completed ? 'Marcar como pendiente' : 'Marcar como completado'}
            >
              {rental.completed ? <Check size={16} /> : <X size={16} />}
            </button>
            <button
              onClick={() => startEditing(rental)}
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700"
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
          </div>
        </div>
        <div className="mt-2 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>Entrada: {rental.checkIn} {rental.checkInTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>Salida: {rental.checkOut} {rental.checkOutTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Horas de limpieza: {rental.cleaningHours}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={16} />
            <span>Trabajador/a: {rental.worker || 'No asignado'}</span>
          </div>
          {rental.extras.length > 0 && (
            <div>Extras: {rental.extras.join(', ')}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-purple-400">
          Gestión de Viviendas Vacacionales
        </h1>

        {/* Upcoming Rentals */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Para Hoy</h2>
            {getUpcomingRentals(0).map(rental => (
              <div key={rental.id} className="mb-4">
                <RentalCard
                  rental={rental}
                  isEditing={editingId === rental.id}
                />
              </div>
            ))}
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Para Mañana</h2>
            {getUpcomingRentals(1).map(rental => (
              <div key={rental.id} className="mb-4">
                <RentalCard
                  rental={rental}
                  isEditing={editingId === rental.id}
                />
              </div>
            ))}
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">Para Pasado Mañana</h2>
            {getUpcomingRentals(2).map(rental => (
              <div key={rental.id} className="mb-4">
                <RentalCard
                  rental={rental}
                  isEditing={editingId === rental.id}
                />
              </div>
            ))}
          </div>
        </div>

        {/* New Rental Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Registrar Nueva Vivienda</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Vivienda</label>
              <select
                value={newRental.property}
                onChange={(e) => setNewRental({...newRental, property: e.target.value})}
                className="w-full bg-gray-700 rounded p-2"
                required
              >
                <option value="">Seleccione una vivienda...</option>
                {properties.map(property => (
                  <option key={property} value={property}>{property}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Trabajador/a</label>
              <select
                value={newRental.worker}
                onChange={(e) => setNewRental({...newRental, worker: e.target.value})}
                className="w-full bg-gray-700 rounded p-2"
              >
                <option value="">Seleccione un trabajador...</option>
                {workers.map(worker => (
                  <option key={worker} value={worker}>{worker}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Fecha de Entrada</label>
              <input
                type="date"
                value={newRental.checkIn}
                onChange={(e) => setNewRental({...newRental, checkIn: e.target.value})}
                className="w-full bg-gray-700 rounded p-2"
              />
            </div>

            <div>
              <label className="block mb-2">Hora de Entrada</label>
              <input
                type="time"
                value={newRental.checkInTime}
                onChange={(e) => setNewRental({...newRental, checkInTime: e.target.value})}
                className="w-full bg-gray-700 rounded p-2"
              />
            </div>

            <div>
              <label className="block mb-2">Fecha de Salida</label>
              <input
                type="date"
                value={newRental.checkOut}
                onChange={(e) => setNewRental({...newRental, checkOut: e.target.value})}
                className="w-full bg-gray-700 rounded p-2"
              />
            </div>

            <div>
              <label className="block mb-2">Hora de Salida</label>
              <input
                type="time"
                value={newRental.checkOutTime}
                onChange={(e) => setNewRental({...newRental, checkOutTime: e.target.value})}
                className="w-full bg-gray-700 rounded p-2"
              />
            </div>

            <div>
              <label className="block mb-2">Horas de Limpieza</label>
              <input
                type="number"
                step="0.5"
                value={newRental.cleaningHours}
                onChange={(e) => setNewRental({...newRental, cleaningHours: parseFloat(e.target.value)})}
                className="w-full bg-gray-700 rounded p-2"
              />
            </div>

            <div>
              <label className="block mb-2">Extras</label>
              <div className="flex gap-4">
                {['Agua', 'Vino', 'Papel'].map(extra => (
                  <label key={extra} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newRental.extras.includes(extra)}
                      onChange={(e) => {
                        const newExtras = e.target.checked
                          ? [...newRental.extras, extra]
                          : newRental.extras.filter(item => item !== extra);
                        setNewRental({...newRental, extras: newExtras});
                      }}
                      className="bg-gray-700 rounded"
                    />
                    {extra}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition-colors"
          >
            Registrar Vivienda
          </button>
        </form>

        {/* History */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-purple-300">Historial de Registros</h2>
            <button
              onClick={downloadCSV}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Descargar CSV
            </button>
          </div>
          
          <div className="space-y-4">
            {rentals.map(rental => (
              <div key={rental.id}>
                <RentalCard
                  rental={rental}
                  isEditing={editingId === rental.id}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;