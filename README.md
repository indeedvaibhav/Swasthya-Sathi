# Swasthya Sathi 🩺

### Your Voice-First Healthcare Companion

Swasthya Sathi is a voice-first healthcare assistant designed to make healthcare technology simpler and more accessible for elderly users.

Instead of navigating through complicated menus, users can simply speak naturally to access their medicines, health vitals, family care information, doctors, appointments, and emergency assistance.

> **"Just speak. We'll take care of the rest."**

---

## 🌐 Live Demo

**Try Swasthya Sathi:**  
https://swasthya-sathii.netlify.app/

The application is optimized for both desktop and mobile devices.

---

## 💡 Problem

Many elderly users find conventional healthcare applications difficult to use because of:

- Small text and complex interfaces
- Multiple navigation steps
- Dependence on typing
- Difficulty remembering where features are located
- Limited accessibility for users who are less comfortable with technology

Swasthya Sathi addresses these challenges by making **voice the primary interaction method**, while keeping a simple visual interface available as a fallback.

---

## ✨ Key Features

### 🎙️ Voice-First Interaction
Users can interact with the application using natural Hindi, Hinglish, or English voice commands.

Examples:

> "मेरी medicines दिखाओ"

> "मेरा blood pressure क्या है?"

> "मेरी family दिखाओ"

> "Doctor दिखाओ"

> "Appointment book करो"

> "Emergency"

---

### 💊 Medicines & Regimen

Users can:

- View their medicines
- See medication schedules
- Mark medicines as taken
- Interact with the medicine system using voice

---

### ❤️ Vitals & Biomarkers

Users can view important health information including:

- Blood pressure
- Blood sugar
- Pulse
- SpO₂
- Historical vital trends

---

### 👨‍👩‍👧 Family Care Circle

The application allows elderly users to access information about their family and caregivers, creating a connected healthcare experience between the patient and their support network.

---

### 👨‍⚕️ Doctor Consultation

Users can browse doctors and begin an appointment flow.

The voice-driven appointment experience allows users to select:

1. Medical specialty
2. Doctor
3. Date
4. Time
5. Confirmation

The entire flow can be completed using voice or the visual interface.

---

### 🚨 Emergency Assistance

The application provides an emergency assistance flow designed for elderly users.

For this exhibition prototype, the emergency flow demonstrates the alert and confirmation experience. It does **not** place real emergency calls or send real SMS messages.

---

## 🧠 How the Voice System Works

Swasthya Sathi uses browser-native speech technologies combined with a custom intent-matching system.

```text
User Speech
     ↓
Speech Recognition
     ↓
Transcript
     ↓
Intent Matcher
     ↓
Application Action
     ↓
UI Update
     ↓
Speech Synthesis Response
