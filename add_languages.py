#!/usr/bin/env python3
# Script to safely add remaining languages to i18n.js

import json

# Read current file
with open('i18n.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Spanish translation
spanish = '''  ,
  
  // 西班牙语
  es: {
    appName: 'AiFriend',
    appSubtitle: 'Tu compañero de IA',
    send: 'Enviar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    close: 'Cerrar',
    welcomeMessage: '¡Hola! Soy AiFriend, elige un personaje para empezar ✨',
    greeting: 'Hola',
    roleSquare: 'Galería de personajes',
    selectRole: 'Seleccionar personaje',
    currentRole: 'Rol actual',
    changeRole: 'Cambiar rol',
    categories: {
      female: 'Personajes femeninos',
      male: 'Personajes masculinos',
      fantasy: 'Personajes de fantasía'
    },
    roles: {
      sister: { name: 'Mujer madura', desc: 'Elegante y encantadora' },
      loli: { name: 'Chica dulce', desc: 'Linda e inocente' },
      girlfriend: { name: 'Novia', desc: 'Dulce y cariñosa' },
      ceo: { name: 'CEO', desc: 'Elite empresarial capaz' },
      nurse: { name: 'Enfermera', desc: 'Gentil y cariñosa' },
      senior: { name: 'Estudiante senior', desc: 'Intelectual y elegante' },
      star: { name: 'Ídolo', desc: 'Glamurosa y deslumbrante' },
      athlete: { name: 'Chica atlética', desc: 'Enérgica y saludable' },
      teacher: { name: 'Maestra', desc: 'Paciente e inspiradora' },
      artist: { name: 'Artista', desc: 'Romántica y creativa' },
      gamer: { name: 'Chica gamer', desc: 'Divertida y enérgica' },
      boyfriend: { name: 'Novio gentil', desc: 'Cariñoso y romántico' },
      dominantCeo: { name: 'CEO dominante', desc: 'Poderoso y devoto' },
      schoolmate: { name: 'Amigo de la infancia', desc: 'Cariñoso y familiar' },
      werewolf: { name: 'Hombre lobo', desc: 'Salvaje y leal' },
      vampire: { name: 'Vampiro', desc: 'Misterioso y elegante' },
      angel: { name: 'Ángel', desc: 'Puro y santo' },
      demon: { name: 'Demonio', desc: 'Seductor y misterioso' }
    },
    freeTries: 'Mensajes gratis',
    remainingTries: '{count} restantes',
    noMoreTries: 'Mensajes gratis agotados',
    upgradeMembership: 'Actualizar',
    becomeMember: 'Hazte miembro',
    membershipBenefits: 'Beneficios de miembro',
    unlimitedChats: 'Chats ilimitados',
    allRoles: 'Todos los personajes',
    longTermMemory: 'Memoria a largo plazo',
    prioritySupport: 'Soporte prioritario',
    buyWithStars: 'Comprar con Stars',
    monthly: 'Mensual',
    yearly: 'Anual',
    lifetime: 'De por vida',
    price: {
      monthly: '100 Stars/mes',
      yearly: '1000 Stars/año',
      lifetime: '3000 Stars de por vida'
    },
    settings: 'Ajustes',
    language: 'Idioma',
    clearHistory: 'Borrar historial',
    about: 'Acerca de',
    typingPlaceholder: 'Escribe un mensaje...',
    sending: 'Enviando...',
    errorSending: 'Error al enviar',
    networkError: 'Error de red',
    chatHistory: 'Historial de chat',
    noHistory: 'Sin historial de chat',
    clearConfirm: '¿Borrar todo el historial de chat?',
    cleared: 'Borrado',
    firstTimeTitle: '¡Bienvenido a AiFriend!',
    firstTimeSubtitle: 'Elige un personaje para comenzar',
    continueChat: 'Continuar',
    newChat: 'Nuevo chat',
    backToHistory: 'Volver al historial'
  }'''

# Insert before the closing };
insert_pos = content.find('\n};\n\n// 获取翻译文本')
if insert_pos != -1:
    new_content = content[:insert_pos] + spanish + content[insert_pos:]
    with open('i18n.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("✅ Added Spanish")
else:
    print("❌ Could not find insertion point")
