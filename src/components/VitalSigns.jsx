import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './VitalSigns.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const VitalSigns = ({ patientId, isDoctor = false }) => {
  const vitalSignsMapping = {
    'blood-pressure': {
      code: '85354-9',
      display: 'Blood pressure panel',
      system: 'http://loinc.org'
    },
    'heart-rate': {
      code: '8867-4',
      display: 'Heart rate',
      system: 'http://loinc.org'
    },
    'oxygen-saturation': {
      code: '2708-6',
      display: 'Oxygen saturation',
      system: 'http://loinc.org'
    }
  };

  const [vitals, setVitals] = useState([]);
  const [newVital, setNewVital] = useState({
    type: 'blood-pressure',
    value: '',
    unit: '',
  });
  const backendUrl = 'http://localhost:3001';
  const [selectedType, setSelectedType] = useState('blood-pressure');
  const [groupedVitals, setGroupedVitals] = useState({});

  useEffect(() => {
    fetchVitals();
  }, [patientId]);

  useEffect(() => {
    if (vitals.length > 0) {
      const grouped = vitals.reduce((acc, vital) => {
        const type = vital.code.coding[0].code;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(vital);
        return acc;
      }, {});
      setGroupedVitals(grouped);
    }
  }, [vitals]);

  const fetchVitals = async () => {
    try {
      const response = await axios.get(`${backendUrl}/patients/${patientId}/vitals`);
      setVitals(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des signes vitaux:', error);
    }
  };

  const getDefaultUnit = (type) => {
    switch (type) {
      case 'blood-pressure':
        return 'mmHg';
      case 'heart-rate':
        return 'bpm';
      case 'oxygen-saturation':
        return '%';
      default:
        return '';
    }
  };

  const formatVitalType = (type) => {
    switch (type) {
      case 'blood-pressure':
        return 'Tension artérielle';
      case 'heart-rate':
        return 'Fréquence cardiaque';
      case 'oxygen-saturation':
        return 'Saturation en oxygène';
      default:
        return type;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewVital(prev => ({
      ...prev,
      [name]: value,
      unit: name === 'type' ? getDefaultUnit(value) : prev.unit
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${backendUrl}/patients/${patientId}/vitals`, newVital);
      setNewVital({ type: 'blood-pressure', value: '', unit: '' });
      fetchVitals();
    } catch (error) {
      console.error('Erreur lors de l\'ajout des signes vitaux:', error);
    }
  };

  const getChartData = (type) => {
    const data = groupedVitals[type] || [];
    return {
      labels: data.map(v => new Date(v.effectiveDateTime).toLocaleDateString()),
      datasets: [
        {
          label: getVitalLabel(type),
          data: data.map(v => v.valueQuantity.value),
          fill: false,
          borderColor: getVitalColor(type),
          tension: 0.1
        }
      ]
    };
  };

  const getVitalLabel = (type) => {
    const labels = {
      '85354-9': 'Tension artérielle',
      '8867-4': 'Fréquence cardiaque',
      '2708-6': 'Saturation en oxygène'
    };
    return labels[type] || type;
  };

  const getVitalColor = (type) => {
    const colors = {
      '85354-9': 'rgb(255, 99, 132)',
      '8867-4': 'rgb(54, 162, 235)',
      '2708-6': 'rgb(75, 192, 192)'
    };
    return colors[type] || 'rgb(201, 203, 207)';
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Évolution des signes vitaux'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  const getGroupedAndSortedVitals = () => {
    const grouped = {
      'blood-pressure': [],
      'heart-rate': [],
      'oxygen-saturation': []
    };

    vitals.forEach(vital => {
      const type = Object.keys(vitalSignsMapping).find(
        key => vitalSignsMapping[key].code === vital.code.coding[0].code
      );
      if (type) {
        grouped[type].push(vital);
      }
    });

    // Trier chaque groupe par date (du plus récent au plus ancien)
    Object.keys(grouped).forEach(type => {
      grouped[type].sort((a, b) => 
        new Date(b.effectiveDateTime) - new Date(a.effectiveDateTime)
      );
    });

    return grouped;
  };

  return (
    <div className="vital-signs">
      {/* Afficher le formulaire uniquement si c'est un médecin */}
      {isDoctor && (
        <div className="vital-signs-input">
          <form onSubmit={handleSubmit} className="vital-signs-form">
            <select
              name="type"
              value={newVital.type}
              onChange={handleChange}
            >
              <option value="blood-pressure">Tension artérielle</option>
              <option value="heart-rate">Fréquence cardiaque</option>
              <option value="oxygen-saturation">Saturation en oxygène</option>
            </select>
            <input
              type="number"
              name="value"
              placeholder="Valeur"
              value={newVital.value}
              onChange={handleChange}
              step="0.1"
            />
            <input
              type="text"
              name="unit"
              placeholder="Unité"
              value={newVital.unit || getDefaultUnit(newVital.type)}
              onChange={handleChange}
              readOnly
            />
            <button type="submit">Ajouter</button>
          </form>
        </div>
      )}

      <div className="vital-signs-charts">
        <div className="chart-controls">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="85354-9">Tension artérielle</option>
            <option value="8867-4">Fréquence cardiaque</option>
            <option value="2708-6">Saturation en oxygène</option>
          </select>
        </div>
        
        <div className="chart-container">
          {Object.keys(groupedVitals).length > 0 && (
            <Line data={getChartData(selectedType)} options={chartOptions} />
          )}
        </div>

        <div className="vital-signs-history">
          <h4>Historique des mesures</h4>
          {Object.entries(getGroupedAndSortedVitals()).map(([type, measurements]) => (
            measurements.length > 0 && (
              <div key={type} className="vital-type-group">
                <h5>{formatVitalType(type)}</h5>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((vital) => (
                      <tr key={vital.id}>
                        <td>{new Date(vital.effectiveDateTime).toLocaleString()}</td>
                        <td>{vital.valueQuantity.value} {vital.valueQuantity.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default VitalSigns;