import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

// ============================================================================
// ARCHETYPE FLOORPLANS & INITIAL INVENTORIES
// ============================================================================
export const HOUSE_ARCHETYPES = {
  '2BHK': {
    name: '2BHK Standard Flat (Nagpur / Mumbai / Pune)',
    areaSqFt: 950,
    footprint: { width: 14, length: 11 },
    rooms: [
      { id: 'living', name: 'Living & Dining Room', type: 'living', x: -2.5, z: -1.5, w: 8.0, l: 6.5, color: '#38332e' },
      { id: 'master_bed', name: 'Master Bedroom', type: 'bedroom', x: 4.0, z: -2.2, w: 4.8, l: 5.0, color: '#302d38' },
      { id: 'bed2', name: 'Bedroom 2 / Kids Room', type: 'bedroom', x: 4.0, z: 3.2, w: 4.8, l: 4.2, color: '#2d3338' },
      { id: 'kitchen', name: 'Modular Kitchen', type: 'kitchen', x: -4.5, z: 3.2, w: 4.0, l: 4.2, color: '#2b362e' },
      { id: 'bath', name: 'Bathroom & Utility', type: 'bathroom', x: 0.2, z: 3.2, w: 2.8, l: 2.2, color: '#29333a' },
      { id: 'balcony', name: 'Balcony', type: 'balcony', x: -1.0, z: 4.6, w: 4.0, l: 1.4, color: '#2e2b27' }
    ],
    defaultAppliances: [
      { id: 1, name: 'Master Bedroom Split AC', category: 'Air Conditioner', rated_w: 1500, bee_star_rating: 3, room: 'master_bed', room_name: 'Master Bedroom', x: 4.0, y: 1.9, z: -4.4, type: 'ac', is_on: true, model_kind: 'thermostatic', temp_c: 24, daily_hours: 6.5, is_opted_in: true },
      { id: 2, name: 'Living Room Ceiling Fan 1', category: 'Ceiling Fan', rated_w: 75, bee_star_rating: 2, room: 'living', room_name: 'Living & Dining Room', x: -4.0, y: 2.2, z: -1.5, type: 'fan', is_on: true, speed: 4, model_kind: 'scheduled', daily_hours: 10.0, is_opted_in: true },
      { id: 3, name: 'Living Room Ceiling Fan 2', category: 'Ceiling Fan', rated_w: 75, bee_star_rating: 2, room: 'living', room_name: 'Living & Dining Room', x: -0.5, y: 2.2, z: -1.5, type: 'fan', is_on: true, speed: 3, model_kind: 'scheduled', daily_hours: 8.0, is_opted_in: true },
      { id: 4, name: 'Master Bed Ceiling Fan', category: 'Ceiling Fan', rated_w: 75, bee_star_rating: 3, room: 'master_bed', room_name: 'Master Bedroom', x: 4.0, y: 2.2, z: -2.2, type: 'fan', is_on: true, speed: 4, model_kind: 'scheduled', daily_hours: 7.0, is_opted_in: true },
      { id: 5, name: 'Double-Door Fridge (260L)', category: 'Refrigerator', rated_w: 140, bee_star_rating: 3, room: 'kitchen', room_name: 'Modular Kitchen', x: -5.8, y: 0.8, z: 2.0, type: 'fridge', is_on: true, model_kind: 'cyclic', daily_hours: 24.0, is_opted_in: true },
      { id: 6, name: '55" 4K Smart LED TV', category: 'Television', rated_w: 65, bee_star_rating: 4, room: 'living', room_name: 'Living & Dining Room', x: -2.5, y: 0.8, z: -4.4, type: 'tv', is_on: true, model_kind: 'scheduled', daily_hours: 5.0, is_opted_in: true },
      { id: 7, name: 'Bathroom Storage Geyser', category: 'Water Geyser', rated_w: 2000, bee_star_rating: 3, room: 'bath', room_name: 'Bathroom & Utility', x: 0.2, y: 1.8, z: 2.2, type: 'geyser', is_on: false, model_kind: 'scheduled', daily_hours: 1.0, is_opted_in: true },
      { id: 8, name: 'Wi-Fi Fiber Router', category: 'Always-On', rated_w: 10, bee_star_rating: 5, room: 'living', room_name: 'Living & Dining Room', x: -0.8, y: 0.5, z: -4.3, type: 'router', is_on: true, model_kind: 'constant', daily_hours: 24.0, is_opted_in: true },
      { id: 9, name: 'Front Load Washing Machine', category: 'Washing Machine', rated_w: 500, bee_star_rating: 5, room: 'balcony', room_name: 'Balcony', x: -2.0, y: 0.5, z: 4.6, type: 'washing_machine', is_on: false, model_kind: 'scheduled', daily_hours: 0.8, is_opted_in: true },
      { id: 10, name: 'Convection Microwave (28L)', category: 'Microwave', rated_w: 1200, bee_star_rating: 4, room: 'kitchen', room_name: 'Modular Kitchen', x: -3.5, y: 0.8, z: 4.5, type: 'microwave', is_on: false, model_kind: 'scheduled', daily_hours: 0.5, is_opted_in: true }
    ]
  },
  '1BHK': {
    name: '1BHK Compact Flat (620 sq.ft)',
    areaSqFt: 620,
    footprint: { width: 11, length: 9 },
    rooms: [
      { id: 'living', name: 'Living & Dining Room', type: 'living', x: -1.8, z: -1.2, w: 6.5, l: 5.5, color: '#38332e' },
      { id: 'master_bed', name: 'Master Bedroom', type: 'bedroom', x: 3.2, z: -1.2, w: 4.2, l: 5.5, color: '#302d38' },
      { id: 'kitchen', name: 'Kitchenette', type: 'kitchen', x: -2.2, z: 2.6, w: 4.8, l: 3.2, color: '#2b362e' },
      { id: 'bath', name: 'Bathroom', type: 'bathroom', x: 2.5, z: 2.6, w: 3.5, l: 3.2, color: '#29333a' }
    ],
    defaultAppliances: [
      { id: 101, name: '1.0-Ton Inverter AC', category: 'Air Conditioner', rated_w: 1100, bee_star_rating: 4, room: 'master_bed', room_name: 'Master Bedroom', x: 3.2, y: 1.9, z: -3.8, type: 'ac', is_on: true, model_kind: 'thermostatic', temp_c: 24, daily_hours: 6.0, is_opted_in: true },
      { id: 102, name: 'Hall Ceiling Fan', category: 'Ceiling Fan', rated_w: 75, bee_star_rating: 2, room: 'living', room_name: 'Living & Dining Room', x: -1.8, y: 2.2, z: -1.2, type: 'fan', is_on: true, speed: 4, model_kind: 'scheduled', daily_hours: 9.0, is_opted_in: true },
      { id: 103, name: 'Single Door Fridge 190L', category: 'Refrigerator', rated_w: 90, bee_star_rating: 4, room: 'kitchen', room_name: 'Kitchenette', x: -4.0, y: 0.7, z: 2.0, type: 'fridge', is_on: true, model_kind: 'cyclic', daily_hours: 24.0, is_opted_in: true },
      { id: 104, name: '43" Smart LED TV', category: 'Television', rated_w: 55, bee_star_rating: 4, room: 'living', room_name: 'Living & Dining Room', x: -1.8, y: 0.7, z: -3.8, type: 'tv', is_on: true, model_kind: 'scheduled', daily_hours: 4.5, is_opted_in: true },
      { id: 105, name: 'Instant Geyser 3kW', category: 'Water Geyser', rated_w: 3000, bee_star_rating: 3, room: 'bath', room_name: 'Bathroom', x: 2.5, y: 1.8, z: 1.8, type: 'geyser', is_on: false, model_kind: 'scheduled', daily_hours: 0.6, is_opted_in: true },
      { id: 106, name: 'Wi-Fi Fiber Router', category: 'Always-On', rated_w: 10, bee_star_rating: 5, room: 'living', room_name: 'Living & Dining Room', x: 0.2, y: 0.5, z: -3.7, type: 'router', is_on: true, model_kind: 'constant', daily_hours: 24.0, is_opted_in: true }
    ]
  },
  '3BHK': {
    name: '3BHK Residence (1,240 sq.ft)',
    areaSqFt: 1240,
    footprint: { width: 17, length: 13 },
    rooms: [
      { id: 'living', name: 'Grand Living & Dining Room', type: 'living', x: -3.5, z: -2.0, w: 9.0, l: 7.5, color: '#38332e' },
      { id: 'master_bed', name: 'Master Suite', type: 'bedroom', x: 4.8, z: -3.0, w: 6.5, l: 5.5, color: '#302d38' },
      { id: 'bed2', name: 'Kids Bedroom', type: 'bedroom', x: 4.8, z: 3.2, w: 5.0, l: 4.8, color: '#2d3338' },
      { id: 'bed3', name: 'Guest / Study Room', type: 'bedroom', x: -4.5, z: 3.5, w: 5.5, l: 4.5, color: '#302d38' },
      { id: 'kitchen', name: 'Modular Kitchen', type: 'kitchen', x: 0.5, z: 3.5, w: 4.0, l: 4.5, color: '#2b362e' },
      { id: 'bath', name: 'Bathrooms (Master & Common)', type: 'bathroom', x: 5.0, z: 0.2, w: 4.8, l: 2.2, color: '#29333a' }
    ],
    defaultAppliances: [
      { id: 201, name: 'Master 1.5-Ton 5★ Inverter AC', category: 'Air Conditioner', rated_w: 1050, bee_star_rating: 5, room: 'master_bed', room_name: 'Master Suite', x: 4.8, y: 1.9, z: -5.5, type: 'ac', is_on: true, model_kind: 'thermostatic', temp_c: 24, daily_hours: 7.0, is_opted_in: true },
      { id: 202, name: 'Kids Bedroom Split AC', category: 'Air Conditioner', rated_w: 1500, bee_star_rating: 3, room: 'bed2', room_name: 'Kids Bedroom', x: 4.8, y: 1.9, z: 1.0, type: 'ac', is_on: false, model_kind: 'thermostatic', temp_c: 24, daily_hours: 5.0, is_opted_in: true },
      { id: 203, name: 'Living Room 5★ BLDC Fan 1', category: 'Ceiling Fan', rated_w: 28, bee_star_rating: 5, room: 'living', room_name: 'Grand Living & Dining Room', x: -5.5, y: 2.2, z: -2.0, type: 'fan', is_on: true, speed: 4, model_kind: 'scheduled', daily_hours: 9.0, is_opted_in: true },
      { id: 204, name: 'Living Room 5★ BLDC Fan 2', category: 'Ceiling Fan', rated_w: 28, bee_star_rating: 5, room: 'living', room_name: 'Grand Living & Dining Room', x: -1.5, y: 2.2, z: -2.0, type: 'fan', is_on: true, speed: 3, model_kind: 'scheduled', daily_hours: 8.0, is_opted_in: true },
      { id: 205, name: 'Side-by-Side Refrigerator 450L', category: 'Refrigerator', rated_w: 180, bee_star_rating: 4, room: 'kitchen', room_name: 'Modular Kitchen', x: -0.8, y: 0.9, z: 2.2, type: 'fridge', is_on: true, model_kind: 'cyclic', daily_hours: 24.0, is_opted_in: true },
      { id: 206, name: '65" OLED 4K Smart Cinema', category: 'Television', rated_w: 95, bee_star_rating: 4, room: 'living', room_name: 'Grand Living & Dining Room', x: -3.5, y: 0.9, z: -5.6, type: 'tv', is_on: true, model_kind: 'scheduled', daily_hours: 5.0, is_opted_in: true },
      { id: 207, name: 'Master Geyser 25L (5★)', category: 'Water Geyser', rated_w: 1800, bee_star_rating: 5, room: 'bath', room_name: 'Bathrooms', x: 5.0, y: 1.8, z: 0.2, type: 'geyser', is_on: false, model_kind: 'scheduled', daily_hours: 1.0, is_opted_in: true },
      { id: 208, name: 'Air Purifier HEPA H13', category: 'Air Purifier', rated_w: 45, bee_star_rating: 5, room: 'living', room_name: 'Grand Living & Dining Room', x: -2.0, y: 0.4, z: 0.5, type: 'purifier', is_on: true, model_kind: 'scheduled', daily_hours: 12.0, is_opted_in: true }
    ]
  },
  'PG_Flat': {
    name: 'Shared PG Flat (Fair Flatmate Split)',
    areaSqFt: 800,
    footprint: { width: 13, length: 10 },
    rooms: [
      { id: 'hall', name: 'Common Hall & Dining', type: 'living', x: -2.5, z: -1.5, w: 7.0, l: 6.0, color: '#38332e' },
      { id: 'room_a', name: 'Room A (AC Room)', type: 'bedroom', x: 3.8, z: -1.5, w: 5.0, l: 6.0, color: '#302d38' },
      { id: 'room_b', name: 'Room B (Fan Room)', type: 'bedroom', x: 3.8, z: 3.0, w: 5.0, l: 4.0, color: '#2d3338' },
      { id: 'kitchen', name: 'Kitchen & Bath', type: 'kitchen', x: -2.5, z: 3.0, w: 7.0, l: 4.0, color: '#2b362e' }
    ],
    defaultAppliances: [
      { id: 301, name: 'Room A Split AC (High Draw)', category: 'Air Conditioner', rated_w: 1500, bee_star_rating: 2, room: 'room_a', room_name: 'Room A (AC Room)', x: 3.8, y: 1.9, z: -4.2, type: 'ac', is_on: true, model_kind: 'thermostatic', temp_c: 22, daily_hours: 8.0, is_opted_in: true },
      { id: 302, name: 'Room A Ceiling Fan', category: 'Ceiling Fan', rated_w: 75, bee_star_rating: 1, room: 'room_a', room_name: 'Room A (AC Room)', x: 3.8, y: 2.2, z: -1.5, type: 'fan', is_on: true, speed: 5, model_kind: 'scheduled', daily_hours: 6.0, is_opted_in: true },
      { id: 303, name: 'Room B Ceiling Fan', category: 'Ceiling Fan', rated_w: 75, bee_star_rating: 2, room: 'room_b', room_name: 'Room B (Fan Room)', x: 3.8, y: 2.2, z: 3.0, type: 'fan', is_on: true, speed: 4, model_kind: 'scheduled', daily_hours: 10.0, is_opted_in: true },
      { id: 304, name: 'Hall Common Fan', category: 'Ceiling Fan', rated_w: 75, bee_star_rating: 2, room: 'hall', room_name: 'Common Hall & Dining', x: -2.5, y: 2.2, z: -1.5, type: 'fan', is_on: true, speed: 4, model_kind: 'scheduled', daily_hours: 12.0, is_opted_in: true },
      { id: 305, name: 'Shared Refrigerator 190L', category: 'Refrigerator', rated_w: 160, bee_star_rating: 2, room: 'kitchen', room_name: 'Kitchen & Bath', x: -5.0, y: 0.8, z: 2.0, type: 'fridge', is_on: true, model_kind: 'cyclic', daily_hours: 24.0, is_opted_in: true },
      { id: 306, name: 'High-Speed Wi-Fi Router', category: 'Always-On', rated_w: 12, bee_star_rating: 5, room: 'hall', room_name: 'Common Hall & Dining', x: -0.5, y: 0.5, z: -4.0, type: 'router', is_on: true, model_kind: 'constant', daily_hours: 24.0, is_opted_in: true }
    ]
  }
};

// ============================================================================
// APPLIANCE TEMPLATES FOR USER ADDITION
// ============================================================================
export const APPLIANCE_TEMPLATES = [
  { label: 'Split AC (1.5 Ton, 3-Star)', category: 'Air Conditioner', rated_w: 1500, bee_star_rating: 3, model_kind: 'thermostatic', daily_hours: 6.0, type: 'ac' },
  { label: '5-Star Inverter AC (1.5 Ton)', category: 'Air Conditioner', rated_w: 1050, bee_star_rating: 5, model_kind: 'thermostatic', daily_hours: 6.0, type: 'ac' },
  { label: 'Standard Ceiling Fan (75W)', category: 'Ceiling Fan', rated_w: 75, bee_star_rating: 2, model_kind: 'scheduled', daily_hours: 9.0, type: 'fan' },
  { label: 'BLDC Energy Saving Fan (28W, 5-Star)', category: 'Ceiling Fan', rated_w: 28, bee_star_rating: 5, model_kind: 'scheduled', daily_hours: 9.0, type: 'fan' },
  { label: 'Double Door Refrigerator (260L)', category: 'Refrigerator', rated_w: 140, bee_star_rating: 3, model_kind: 'cyclic', daily_hours: 24.0, type: 'fridge' },
  { label: 'Side-by-Side Refrigerator (450L)', category: 'Refrigerator', rated_w: 180, bee_star_rating: 4, model_kind: 'cyclic', daily_hours: 24.0, type: 'fridge' },
  { label: 'Storage Water Geyser (25L)', category: 'Water Geyser', rated_w: 2000, bee_star_rating: 3, model_kind: 'scheduled', daily_hours: 1.0, type: 'geyser' },
  { label: 'Instant Water Geyser (3kW)', category: 'Water Geyser', rated_w: 3000, bee_star_rating: 3, model_kind: 'scheduled', daily_hours: 0.5, type: 'geyser' },
  { label: 'Smart 4K LED TV (55")', category: 'Television', rated_w: 65, bee_star_rating: 4, model_kind: 'scheduled', daily_hours: 5.0, type: 'tv' },
  { label: 'Fully Automatic Washing Machine (7kg)', category: 'Washing Machine', rated_w: 500, bee_star_rating: 5, model_kind: 'scheduled', daily_hours: 0.7, type: 'washing_machine' },
  { label: 'Convection Microwave (28L)', category: 'Microwave', rated_w: 1200, bee_star_rating: 4, model_kind: 'scheduled', daily_hours: 0.5, type: 'microwave' },
  { label: 'Air Purifier (HEPA H13)', category: 'Air Purifier', rated_w: 45, bee_star_rating: 5, model_kind: 'scheduled', daily_hours: 12.0, type: 'purifier' },
  { label: 'Room Heater / Blower (2000W)', category: 'Room Heater', rated_w: 2000, bee_star_rating: 2, model_kind: 'scheduled', daily_hours: 3.0, type: 'heater' },
  { label: 'Desktop Workstation / PC', category: 'Computer', rated_w: 180, bee_star_rating: 4, model_kind: 'scheduled', daily_hours: 6.0, type: 'computer' },
  { label: 'Study Laptop + Charger', category: 'Computer', rated_w: 65, bee_star_rating: 5, model_kind: 'scheduled', daily_hours: 6.0, type: 'computer' },
  { label: 'LED Batten / Tube (20W)', category: 'Lighting', rated_w: 20, bee_star_rating: 5, model_kind: 'scheduled', daily_hours: 6.0, type: 'light' },
  { label: 'Wi-Fi Fiber Router', category: 'Always-On', rated_w: 10, bee_star_rating: 5, model_kind: 'constant', daily_hours: 24.0, type: 'router' },
  { label: 'Kitchen Induction Cooktop (1600W)', category: 'Cooking', rated_w: 1600, bee_star_rating: 4, model_kind: 'scheduled', daily_hours: 1.5, type: 'induction' },
  { label: 'Water Cooler / Dispenser (20L)', category: 'Water Cooler', rated_w: 500, bee_star_rating: 4, model_kind: 'cyclic', daily_hours: 5.0, type: 'cooler' }
];

export default function HomeSimulator3D({
  archetype = '2BHK',
  onAppliancesChanged,
  liveWattsTotal = 0
}) {
  const mountRef = useRef(null);
  const containerRef = useRef(null);

  // User State
  const [currentArchetype, setCurrentArchetype] = useState(archetype);
  const [appliances, setAppliances] = useState(() => HOUSE_ARCHETYPES[archetype]?.defaultAppliances || []);
  const [selectedAppliance, setSelectedAppliance] = useState(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('day'); // 'day', 'evening', 'night'
  const [cameraPreset, setCameraPreset] = useState('iso'); // 'iso', 'top', 'master', 'living'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // New Appliance Form State
  const [newTemplateIdx, setNewTemplateIdx] = useState(0);
  const [newCustomName, setNewCustomName] = useState('');
  const [newRoomId, setNewRoomId] = useState('living');
  const [newRatedW, setNewRatedW] = useState(75);
  const [newDailyHours, setNewDailyHours] = useState(6.0);
  const [newBeeStar, setNewBeeStar] = useState(4);
  const [newQuantity, setNewQuantity] = useState(1);

  // Synchronize when archetype prop changes
  useEffect(() => {
    if (HOUSE_ARCHETYPES[archetype]) {
      setCurrentArchetype(archetype);
      const defaults = HOUSE_ARCHETYPES[archetype].defaultAppliances.map(a => ({ ...a }));
      setAppliances(defaults);
      setSelectedAppliance(null);
    }
  }, [archetype]);

  // Notify parent of appliance state changes for live tariff calculation
  useEffect(() => {
    if (onAppliancesChanged) {
      onAppliancesChanged(appliances.filter(a => a.is_opted_in));
    }
  }, [appliances, onAppliancesChanged]);

  // Compute stats
  const activeAppliances = useMemo(() => appliances.filter(a => a.is_opted_in), [appliances]);
  const liveDrawW = useMemo(() => {
    return activeAppliances.reduce((acc, a) => {
      if (!a.is_on) return acc + (a.rated_w * 0.02); // 2% standby
      if (a.model_kind === 'thermostatic') return acc + (a.rated_w * 0.75);
      if (a.model_kind === 'cyclic') return acc + (a.rated_w * 0.42);
      return acc + a.rated_w;
    }, 0);
  }, [activeAppliances]);

  // Toggle appliance Opt-In / Opt-Out
  const handleToggleOptIn = (id) => {
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, is_opted_in: !a.is_opted_in } : a));
    if (selectedAppliance?.id === id) {
      setSelectedAppliance(null);
    }
  };

  // Toggle appliance ON / OFF
  const handleToggleOnOff = (id) => {
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, is_on: !a.is_on } : a));
    if (selectedAppliance?.id === id) {
      setSelectedAppliance(prev => prev ? { ...prev, is_on: !prev.is_on } : null);
    }
  };

  // Delete appliance
  const handleDeleteAppliance = (id) => {
    setAppliances(prev => prev.filter(a => a.id !== id));
    if (selectedAppliance?.id === id) setSelectedAppliance(null);
  };

  // Add new appliance to house
  const handleAddAppliance = (e) => {
    e.preventDefault();
    const tpl = APPLIANCE_TEMPLATES[newTemplateIdx];
    const floorplan = HOUSE_ARCHETYPES[currentArchetype];
    const targetRoom = floorplan.rooms.find(r => r.id === newRoomId) || floorplan.rooms[0];

    const added = [];
    const count = Math.max(1, Math.min(5, Number(newQuantity) || 1));

    for (let i = 0; i < count; i++) {
      const id = Date.now() + i;
      const name = newCustomName.trim()
        ? (count > 1 ? `${newCustomName.trim()} ${i + 1}` : newCustomName.trim())
        : (count > 1 ? `${tpl.label} ${i + 1}` : tpl.label);

      // Random jitter within room bounds
      const jitterX = (Math.random() - 0.5) * (targetRoom.w * 0.5);
      const jitterZ = (Math.random() - 0.5) * (targetRoom.l * 0.5);

      let posY = 0.5;
      if (tpl.type === 'fan') posY = 2.2;
      else if (tpl.type === 'ac') posY = 1.9;
      else if (tpl.type === 'geyser') posY = 1.8;

      added.push({
        id,
        name,
        category: tpl.category,
        rated_w: Number(newRatedW) || tpl.rated_w,
        bee_star_rating: Number(newBeeStar) || tpl.bee_star_rating,
        room: targetRoom.id,
        room_name: targetRoom.name,
        x: targetRoom.x + jitterX,
        y: posY,
        z: targetRoom.z + jitterZ,
        type: tpl.type,
        is_on: true,
        model_kind: tpl.model_kind,
        temp_c: tpl.type === 'ac' ? 24 : undefined,
        speed: tpl.type === 'fan' ? 4 : undefined,
        daily_hours: Number(newDailyHours) || tpl.daily_hours,
        is_opted_in: true
      });
    }

    setAppliances(prev => [...prev, ...added]);
    setNewCustomName('');
  };

  // Fullscreen trigger
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // ==========================================================================
  // THREE.JS SCENE SETUP & RENDER LOOP
  // ==========================================================================
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(timeOfDay === 'night' ? '#080706' : timeOfDay === 'evening' ? '#14100c' : '#0c0a09');
    scene.fog = new THREE.FogExp2(scene.background, 0.025);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(12, 14, 16);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = timeOfDay === 'night' ? 0.75 : timeOfDay === 'evening' ? 1.0 : 1.15;
    mount.appendChild(renderer.domElement);

    // 3. Lighting
    const hemiLight = new THREE.HemisphereLight(
      timeOfDay === 'night' ? '#1e1e2f' : timeOfDay === 'evening' ? '#f59e0b' : '#ffffff',
      timeOfDay === 'night' ? '#0a0a10' : '#1c1917',
      timeOfDay === 'night' ? 0.35 : 0.65
    );
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(
      timeOfDay === 'evening' ? '#fbbf24' : '#fff7ed',
      timeOfDay === 'night' ? 0.2 : timeOfDay === 'evening' ? 1.4 : 1.2
    );
    sunLight.position.set(16, 24, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Interior Warm Fill
    const interiorLight = new THREE.PointLight('#fef3c7', timeOfDay === 'night' ? 1.5 : 0.8, 20);
    interiorLight.position.set(0, 3, 0);
    scene.add(interiorLight);

    // 4. Ground Foundation Slab
    const footprint = HOUSE_ARCHETYPES[currentArchetype]?.footprint || { width: 14, length: 11 };
    const slabGeo = new THREE.BoxGeometry(footprint.width + 1.2, 0.3, footprint.length + 1.2);
    const slabMat = new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.9, metalness: 0.1 });
    const groundSlab = new THREE.Mesh(slabGeo, slabMat);
    groundSlab.position.y = -0.15;
    groundSlab.receiveShadow = true;
    scene.add(groundSlab);

    // Grid guide below house
    const gridHelper = new THREE.GridHelper(30, 30, '#f59e0b', '#292524');
    gridHelper.position.y = -0.31;
    scene.add(gridHelper);

    // 5. Rooms & Walls
    const rooms = HOUSE_ARCHETYPES[currentArchetype]?.rooms || [];
    const roomMeshes = [];

    rooms.forEach(r => {
      // Floor plane
      const floorGeo = new THREE.PlaneGeometry(r.w, r.l);
      const floorMat = new THREE.MeshStandardMaterial({
        color: r.color,
        roughness: 0.85,
        metalness: 0.05
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(r.x, 0.01, r.z);
      floor.receiveShadow = true;
      scene.add(floor);

      // Low boundary partition walls (0.8m high for clean architectural dollhouse view)
      const wallMat = new THREE.MeshStandardMaterial({ color: '#57534e', roughness: 0.9 });
      const wallThick = 0.12;
      const wallH = 0.85;

      // N wall
      const wallN = new THREE.Mesh(new THREE.BoxGeometry(r.w, wallH, wallThick), wallMat);
      wallN.position.set(r.x, wallH / 2, r.z - r.l / 2);
      wallN.castShadow = true;
      scene.add(wallN);

      // S wall
      const wallS = new THREE.Mesh(new THREE.BoxGeometry(r.w, wallH, wallThick), wallMat);
      wallS.position.set(r.x, wallH / 2, r.z + r.l / 2);
      wallS.castShadow = true;
      scene.add(wallS);

      // W wall
      const wallW = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, r.l), wallMat);
      wallW.position.set(r.x - r.w / 2, wallH / 2, r.z);
      wallW.castShadow = true;
      scene.add(wallW);

      // E wall
      const wallE = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, r.l), wallMat);
      wallE.position.set(r.x + r.w / 2, wallH / 2, r.z);
      wallE.castShadow = true;
      scene.add(wallE);

      roomMeshes.push(floor);
    });

    // 6. Opted-In Appliances in 3D
    const interactiveObjects = [];
    const animatedElements = [];

    const activeList = appliances.filter(a => a.is_opted_in);

    activeList.forEach(app => {
      const appGroup = new THREE.Group();
      appGroup.position.set(app.x, app.y, app.z);
      appGroup.userData = { applianceId: app.id, appliance: app };

      const isOn = app.is_on;

      // Model representation according to category
      if (app.type === 'ac') {
        // Split AC Indoor Unit
        const acBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.32, 0.24),
          new THREE.MeshStandardMaterial({ color: '#f5f5f4', roughness: 0.3 })
        );
        acBody.castShadow = true;
        appGroup.add(acBody);

        // LED Indicator
        const ledMat = new THREE.MeshBasicMaterial({ color: isOn ? '#10b981' : '#78716c' });
        const led = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), ledMat);
        led.position.set(0.35, 0.08, 0.125);
        appGroup.add(led);

        // Air shimmer cone when running
        if (isOn) {
          const coneMat = new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.12, side: THREE.DoubleSide });
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 16, 1, true), coneMat);
          cone.rotation.x = Math.PI / 4;
          cone.position.set(0, -0.45, 0.3);
          appGroup.add(cone);
        }
      } else if (app.type === 'fan') {
        // Ceiling Fan Motor Hub
        const hub = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16),
          new THREE.MeshStandardMaterial({ color: '#a8a29e', roughness: 0.4, metalness: 0.3 })
        );
        appGroup.add(hub);

        // Rotating Blades Group
        const bladesGroup = new THREE.Group();
        const bladeGeo = new THREE.BoxGeometry(0.65, 0.01, 0.12);
        const bladeMat = new THREE.MeshStandardMaterial({ color: '#d6d3d1', roughness: 0.6 });

        for (let b = 0; b < 3; b++) {
          const blade = new THREE.Mesh(bladeGeo, bladeMat);
          blade.position.x = 0.38;
          const bladeArm = new THREE.Group();
          bladeArm.rotation.y = (b * Math.PI * 2) / 3;
          bladeArm.add(blade);
          bladesGroup.add(bladeArm);
        }
        appGroup.add(bladesGroup);

        if (isOn) {
          animatedElements.push({
            update: (delta) => {
              bladesGroup.rotation.y += delta * 12.0;
            }
          });
        }
      } else if (app.type === 'fridge') {
        // Refrigerator Cabinet
        const fridgeBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, 1.45, 0.65),
          new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.25, metalness: 0.2 })
        );
        fridgeBody.castShadow = true;
        appGroup.add(fridgeBody);

        // Door handle
        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8),
          new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8 })
        );
        handle.position.set(0.28, 0.2, 0.35);
        appGroup.add(handle);
      } else if (app.type === 'tv') {
        // LED TV Screen & Stand
        const tvScreen = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.7, 0.04),
          new THREE.MeshStandardMaterial({
            color: isOn ? '#0f172a' : '#020617',
            emissive: isOn ? '#38bdf8' : '#000000',
            emissiveIntensity: isOn ? 0.35 : 0.0,
            roughness: 0.2
          })
        );
        tvScreen.castShadow = true;
        appGroup.add(tvScreen);

        // Stand
        const stand = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.02, 0.25),
          new THREE.MeshStandardMaterial({ color: '#334155' })
        );
        stand.position.y = -0.36;
        appGroup.add(stand);
      } else if (app.type === 'geyser') {
        // Cylindrical Storage Geyser
        const tank = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.22, 0.6, 20),
          new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.3 })
        );
        tank.castShadow = true;
        appGroup.add(tank);

        // Status Lamp
        const lamp = new THREE.Mesh(
          new THREE.SphereGeometry(0.02, 8, 8),
          new THREE.MeshBasicMaterial({ color: isOn ? '#f59e0b' : '#64748b' })
        );
        lamp.position.set(0, 0, 0.23);
        appGroup.add(lamp);
      } else if (app.type === 'washing_machine') {
        // Washing machine with circular drum window
        const washer = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.85, 0.6),
          new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 })
        );
        washer.castShadow = true;
        appGroup.add(washer);

        const drumWindow = new THREE.Mesh(
          new THREE.CircleGeometry(0.18, 24),
          new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1, metalness: 0.5 })
        );
        drumWindow.position.set(0, 0.05, 0.31);
        appGroup.add(drumWindow);
      } else if (app.type === 'router') {
        // Wi-Fi Router
        const routerBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 0.04, 0.16),
          new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.5 })
        );
        appGroup.add(routerBody);

        // Antennae
        [-0.08, 0.08].forEach(antX => {
          const ant = new THREE.Mesh(
            new THREE.CylinderGeometry(0.005, 0.005, 0.15, 6),
            new THREE.MeshStandardMaterial({ color: '#1e293b' })
          );
          ant.position.set(antX, 0.1, 0);
          appGroup.add(ant);
        });
      } else {
        // Generic Clean Appliance Box
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.35, 0.35),
          new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.5 })
        );
        box.castShadow = true;
        appGroup.add(box);
      }

      // Selection Marker Ring (shown if selected)
      if (selectedAppliance?.id === app.id) {
        const ringGeo = new THREE.RingGeometry(0.5, 0.58, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: '#f59e0b', side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = -app.y + 0.02;
        appGroup.add(ring);
      }

      scene.add(appGroup);
      interactiveObjects.push(appGroup);
    });

    // 7. Raycasting for Direct 3D Appliance Clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let parent = intersects[0].object;
        while (parent && !parent.userData?.applianceId) {
          parent = parent.parent;
        }
        if (parent && parent.userData?.appliance) {
          setSelectedAppliance(parent.userData.appliance);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // 8. Custom Smooth Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = { radius: 22, phi: Math.PI / 3.2, theta: Math.PI / 4 };
    const centerTarget = new THREE.Vector3(0, 0, 0);

    const updateCameraFromSpherical = () => {
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2.05, spherical.phi));
      spherical.radius = Math.max(6, Math.min(45, spherical.radius));

      camera.position.x = centerTarget.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = centerTarget.y + spherical.radius * Math.cos(spherical.phi);
      camera.position.z = centerTarget.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(centerTarget);
    };

    updateCameraFromSpherical();

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      spherical.theta -= deltaX * 0.008;
      spherical.phi -= deltaY * 0.008;
      updateCameraFromSpherical();
    };

    const onMouseUp = () => { isDragging = false; };

    const onWheel = (e) => {
      e.preventDefault();
      spherical.radius += e.deltaY * 0.015;
      updateCameraFromSpherical();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Camera preset handler
    if (cameraPreset === 'top') {
      spherical.phi = 0.12;
      spherical.theta = 0;
      spherical.radius = 20;
      updateCameraFromSpherical();
    } else if (cameraPreset === 'master') {
      centerTarget.set(4, 1, -2);
      spherical.phi = Math.PI / 4;
      spherical.theta = Math.PI / 2;
      spherical.radius = 8;
      updateCameraFromSpherical();
    } else if (cameraPreset === 'living') {
      centerTarget.set(-2, 1, -1);
      spherical.phi = Math.PI / 4;
      spherical.theta = 0;
      spherical.radius = 9;
      updateCameraFromSpherical();
    } else {
      centerTarget.set(0, 0, 0);
      spherical.phi = Math.PI / 3.2;
      spherical.theta = Math.PI / 4;
      spherical.radius = 22;
      updateCameraFromSpherical();
    }

    // 9. Resize Handling
    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      animatedElements.forEach(item => item.update(delta));
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentArchetype, appliances, selectedAppliance, timeOfDay, cameraPreset]);

  return (
    <div className="viewport-3d-fullscreen" ref={containerRef}>
      {/* 3D WebGL Canvas Target */}
      <div className="viewport-3d-canvas" ref={mountRef} />

      {/* Clean Unobtrusive Top Toolbar (ZERO SLOPPY FLOATING WIDGETS) */}
      <div className="toolbar-3d-top">
        {/* Left: Camera Presets & Environment */}
        <div className="toolbar-group">
          <button
            className={`toolbar-btn ${cameraPreset === 'iso' ? 'active' : ''}`}
            onClick={() => setCameraPreset('iso')}
            title="Isometric 3D Angle"
          >
            🏠 Isometric
          </button>
          <button
            className={`toolbar-btn ${cameraPreset === 'top' ? 'active' : ''}`}
            onClick={() => setCameraPreset('top')}
            title="Top Floorplan View"
          >
            📐 Top View
          </button>
          <button
            className={`toolbar-btn ${cameraPreset === 'living' ? 'active' : ''}`}
            onClick={() => setCameraPreset('living')}
            title="Zoom into Living Hall"
          >
            🛋️ Hall
          </button>
          <button
            className={`toolbar-btn ${cameraPreset === 'master' ? 'active' : ''}`}
            onClick={() => setCameraPreset('master')}
            title="Zoom into Master Bedroom"
          >
            🛏️ Bedroom
          </button>

          <span style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', margin: '0 4px' }} />

          <button
            className={`toolbar-btn ${timeOfDay === 'day' ? 'active' : ''}`}
            onClick={() => setTimeOfDay('day')}
            title="Daylight"
          >
            ☀️ Day
          </button>
          <button
            className={`toolbar-btn ${timeOfDay === 'evening' ? 'active' : ''}`}
            onClick={() => setTimeOfDay('evening')}
            title="Golden Hour"
          >
            🌅 Evening
          </button>
          <button
            className={`toolbar-btn ${timeOfDay === 'night' ? 'active' : ''}`}
            onClick={() => setTimeOfDay('night')}
            title="Night Interior Lights"
          >
            🌙 Night
          </button>
        </div>

        {/* Right: Fullscreen & Appliance Studio Action */}
        <div className="toolbar-group">
          <div className="status-pill">
            <span className="status-dot live" />
            <span style={{ color: 'var(--text-primary)' }}>{Math.round(liveDrawW).toLocaleString('en-IN')} W</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Live Draw</span>
          </div>

          <button
            className="toolbar-btn"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter True Fullscreen'}
          >
            {isFullscreen ? '↙️ Window' : '↗️ Fullscreen'}
          </button>

          <button
            className="toolbar-btn-action"
            onClick={() => setIsStudioOpen(true)}
          >
            ⚙️ Appliance Studio ({activeAppliances.length} Active)
          </button>
        </div>
      </div>

      {/* Docked Detail Card for Clicked 3D Appliance (Bottom Right, Unobtrusive) */}
      {selectedAppliance && (
        <div className="docked-inspector-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <div>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-amber)' }}>
                {selectedAppliance.room_name}
              </span>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {selectedAppliance.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedAppliance(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: selectedAppliance.is_on ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
              ● {selectedAppliance.is_on ? 'Running Active' : 'Standby Mode'}
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={selectedAppliance.is_on}
                onChange={() => handleToggleOnOff(selectedAppliance.id)}
              />
              <span className="slider-toggle" />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>POWER DRAW</span>
              <strong>{selectedAppliance.rated_w} W</strong>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>BEE STAR</span>
              <strong>{'★'.repeat(selectedAppliance.bee_star_rating || 3)}</strong>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>DAILY USAGE</span>
              <strong>{selectedAppliance.daily_hours} hrs/day</strong>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>MONTHLY EST.</span>
              <strong>~{Math.round((selectedAppliance.rated_w * selectedAppliance.daily_hours * 30) / 1000)} kWh</strong>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Slide-Out Appliance Studio Drawer (Full Control in User Hands) */}
      <div className={`appliance-studio-drawer ${isStudioOpen ? '' : 'closed'}`}>
        <div className="drawer-header">
          <div className="drawer-title">
            <span>⚙️</span>
            <span>Appliance Customizer</span>
          </div>
          <button className="drawer-close-btn" onClick={() => setIsStudioOpen(false)}>
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {/* Quick Notice */}
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--border-accent)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--accent-amber-light)' }}>
            💡 <strong>Your 3D Digital Twin:</strong> Toggle any appliance ON or OFF to include/exclude it from the 3D visualizer and bill forecast.
          </div>

          {/* Section: Add New Appliance */}
          <div className="card-panel" style={{ padding: '1rem', background: 'var(--bg-secondary)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
              + Add Custom Appliance
            </h4>
            <form onSubmit={handleAddAppliance} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div>
                <label className="input-label">Appliance Type</label>
                <select
                  className="select-input"
                  value={newTemplateIdx}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setNewTemplateIdx(idx);
                    const t = APPLIANCE_TEMPLATES[idx];
                    setNewRatedW(t.rated_w);
                    setNewDailyHours(t.daily_hours);
                    setNewBeeStar(t.bee_star_rating);
                  }}
                >
                  {APPLIANCE_TEMPLATES.map((t, idx) => (
                    <option key={idx} value={idx}>{t.label} ({t.rated_w}W)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Custom Label (Optional)</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. Master Bedroom Inverter AC"
                  value={newCustomName}
                  onChange={(e) => setNewCustomName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="input-label">Target Room</label>
                  <select
                    className="select-input"
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                  >
                    {HOUSE_ARCHETYPES[currentArchetype]?.rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Rated Watts (W)</label>
                  <input
                    type="number"
                    className="text-input"
                    value={newRatedW}
                    onChange={(e) => setNewRatedW(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="input-label">Daily Hours (h)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="text-input"
                    value={newDailyHours}
                    onChange={(e) => setNewDailyHours(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="input-label">BEE Star Rating</label>
                  <select
                    className="select-input"
                    value={newBeeStar}
                    onChange={(e) => setNewBeeStar(Number(e.target.value))}
                  >
                    <option value="5">5-Star (High Efficiency)</option>
                    <option value="4">4-Star</option>
                    <option value="3">3-Star (Standard)</option>
                    <option value="2">2-Star</option>
                    <option value="1">1-Star (High Energy Draw)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '0.6rem', marginTop: '0.25rem' }}>
                Add to 3D Virtual Household
              </button>
            </form>
          </div>

          {/* Section: Active Appliances Inventory */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Configured Appliances ({appliances.length})
              </span>
              <button
                onClick={() => {
                  const defaults = HOUSE_ARCHETYPES[currentArchetype]?.defaultAppliances.map(a => ({ ...a })) || [];
                  setAppliances(defaults);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-amber)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Reset to Archetype Defaults
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {appliances.map(app => (
                <div
                  key={app.id}
                  className={`appliance-item-card ${app.is_opted_in ? '' : 'opted-out'}`}
                >
                  <div className="appliance-item-header">
                    <div className="appliance-meta">
                      <span className="appliance-name">{app.name}</span>
                      <span className="appliance-sub">
                        {app.room_name} · {app.rated_w}W · {'★'.repeat(app.bee_star_rating || 3)} · {app.daily_hours}h/day
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <label className="switch" title="Toggle Opt-In / Opt-Out of 3D Scene">
                        <input
                          type="checkbox"
                          checked={app.is_opted_in}
                          onChange={() => handleToggleOptIn(app.id)}
                        />
                        <span className="slider-toggle" />
                      </label>

                      <button
                        onClick={() => handleDeleteAppliance(app.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 6px', fontSize: '0.8rem' }}
                        title="Remove appliance"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
