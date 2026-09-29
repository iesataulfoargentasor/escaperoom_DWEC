import type { Room } from "../types";

export const rooms: Room[] = [
  {
    "id": "sala1",
    "nombre": "El Panel de Energía",
    "concepto": "Variables y operadores",
    "historia": "La puerta del laboratorio funciona con tres paneles solares. El sistema solo se desbloquea si le indicas la energía media de los tres, pero el lector no admite decimales: los redondea siempre hacia abajo.",
    "enunciado": "Escribe la función energiaMedia(a, b, c) que devuelva la media de los tres valores, redondeada hacia abajo.",
    "plantilla": "function energiaMedia(a, b, c) {\n  // Tu código aquí\n  \n}",
    "fnName": "energiaMedia",
    "pruebas": [
      {
        "args": [
          4,
          6,
          8
        ],
        "expected": 6
      },
      {
        "args": [
          3,
          4,
          5
        ],
        "expected": 4
      },
      {
        "args": [
          1,
          2,
          3
        ],
        "expected": 2
      },
      {
        "args": [
          10,
          20,
          31
        ],
        "expected": 20
      },
      {
        "args": [
          -1,
          0,
          0
        ],
        "expected": -1
      },
      {
        "args": [
          0,
          0,
          0
        ],
        "expected": 0
      }
    ],
    "pista": "Suma los tres valores, divídelos entre 3 y redondea hacia abajo con Math.floor().",
    "clave": "E"
  },
  {
    "id": "sala2",
    "nombre": "El Mensaje Cifrado",
    "concepto": "Strings",
    "historia": "Un panel muestra un mensaje imposible de leer: «ALOW OLAB». El guardián de esta puerta solo entiende los textos escritos al revés. Tendrás que aprender a invertir cadenas para comunicarte con él.",
    "enunciado": "Escribe la función invertir(texto) que devuelva el mismo texto con sus letras en orden inverso. Trabajamos con puntos de código Unicode (también emoji simples), no con grafemas compuestos.",
    "plantilla": "function invertir(texto) {\n  // Tu código aquí\n  \n}",
    "fnName": "invertir",
    "pruebas": [
      {
        "args": [
          "HOLA"
        ],
        "expected": "ALOH"
      },
      {
        "args": [
          "JS"
        ],
        "expected": "SJ"
      },
      {
        "args": [
          "DWEC"
        ],
        "expected": "CEWD"
      },
      {
        "args": [
          "escapar"
        ],
        "expected": "rapacse"
      },
      {
        "args": [
          ""
        ],
        "expected": ""
      },
      {
        "args": [
          "A🙂B"
        ],
        "expected": "B🙂A"
      }
    ],
    "pista": "Convierte texto en un array con [...texto], invierte el array y une sus elementos con join('').",
    "clave": "S"
  },
  {
    "id": "sala3",
    "nombre": "La Cerradura del Guardián",
    "concepto": "Condicionales",
    "historia": "La siguiente puerta tiene una cerradura numérica caprichosa. Según el número que introduzcas, gira hacia un lado o hacia otro… y solo una combinación la abre del todo. Deberás programar su lógica.",
    "enunciado": "Escribe la función abrirCerradura(n) que devuelva: \"ABRIR\" si n es divisible entre 3 y entre 5, \"IZQUIERDA\" si solo es divisible entre 3, \"DERECHA\" si solo es divisible entre 5, y \"BLOQUEADO\" en cualquier otro caso.",
    "plantilla": "function abrirCerradura(n) {\n  // Tu código aquí\n  \n}",
    "fnName": "abrirCerradura",
    "pruebas": [
      {
        "args": [
          15
        ],
        "expected": "ABRIR"
      },
      {
        "args": [
          9
        ],
        "expected": "IZQUIERDA"
      },
      {
        "args": [
          10
        ],
        "expected": "DERECHA"
      },
      {
        "args": [
          7
        ],
        "expected": "BLOQUEADO"
      },
      {
        "args": [
          30
        ],
        "expected": "ABRIR"
      },
      {
        "args": [
          0
        ],
        "expected": "ABRIR"
      },
      {
        "args": [
          -15
        ],
        "expected": "ABRIR"
      }
    ],
    "pista": "n % 3 === 0 comprueba si n es divisible entre 3. Piensa en el orden de tus if: comprueba primero el caso de divisible entre ambos.",
    "clave": "C"
  },
  {
    "id": "sala4",
    "nombre": "La Sala de los Sensores",
    "concepto": "Bucles y arrays",
    "historia": "El pasillo está plagado de sensores. Cada uno reporta un valor: los que superan 100 están en alerta. Para desactivar la alarma necesitas saber cuántos sensores hay en alerta… y hay demasiados para contarlos a mano.",
    "enunciado": "Escribe la función contarAlertas(valores) que devuelva cuántos números del array son mayores que 100.",
    "plantilla": "function contarAlertas(valores) {\n  // Tu código aquí\n  \n}",
    "fnName": "contarAlertas",
    "pruebas": [
      {
        "args": [
          [
            120,
            45,
            230,
            99,
            100
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          [
            101
          ]
        ],
        "expected": 1
      },
      {
        "args": [
          [
            -5,
            0,
            100,
            101,
            300
          ]
        ],
        "expected": 2
      },
      {
        "args": [
          []
        ],
        "expected": 0
      },
      {
        "args": [
          [
            100,
            100,
            100
          ]
        ],
        "expected": 0
      }
    ],
    "pista": "Recorre el array con for...of (o un for clásico con .length) y suma 1 por cada valor > 100. También puedes usar valores.filter(v => v > 100).length.",
    "clave": "A"
  },
  {
    "id": "sala5",
    "nombre": "El Inventario del Almacén",
    "concepto": "Objetos",
    "historia": "En el almacén del laboratorio hay decenas de objetos, pero solo los mágicos alimentan el mecanismo de la puerta. Cada objeto se representa con { nombre, peso, esMagico }. Necesitas la lista de nombres de los objetos mágicos, en el mismo orden.",
    "enunciado": "Escribe la función objetosMagicos(items) que devuelva un array con los nombres de los objetos cuya propiedad esMagico sea true, respetando el orden original.",
    "plantilla": "function objetosMagicos(items) {\n  // Tu código aquí\n  \n}",
    "fnName": "objetosMagicos",
    "pruebas": [
      {
        "args": [
          [
            {
              "nombre": "Llave",
              "peso": 1,
              "esMagico": true
            },
            {
              "nombre": "Tuerca",
              "peso": 2,
              "esMagico": false
            },
            {
              "nombre": "Orbe",
              "peso": 3,
              "esMagico": true
            }
          ]
        ],
        "expected": [
          "Llave",
          "Orbe"
        ]
      },
      {
        "args": [
          [
            {
              "nombre": "Cable",
              "peso": 2,
              "esMagico": false
            }
          ]
        ],
        "expected": []
      },
      {
        "args": [
          [
            {
              "nombre": "Perla",
              "peso": 1,
              "esMagico": true
            },
            {
              "nombre": "Rune",
              "peso": 1,
              "esMagico": true
            }
          ]
        ],
        "expected": [
          "Perla",
          "Rune"
        ]
      },
      {
        "args": [
          []
        ],
        "expected": []
      },
      {
        "args": [
          [
            {
              "nombre": "Falso",
              "esMagico": 1
            },
            {
              "nombre": "Real",
              "esMagico": true
            }
          ]
        ],
        "expected": [
          "Real"
        ]
      }
    ],
    "pista": "Usa filter() para quedarte con los que cumplan item.esMagico, y después map() para quedarte solo con el nombre.",
    "clave": "P"
  },
  {
    "id": "sala6",
    "nombre": "La Puerta Final",
    "concepto": "Funciones y arrays de objetos",
    "historia": "Ya casi estás. La última puerta solo se abre con los nombres de los exploradores que consiguieron una llave. El sistema los tiene registrados como objetos { nombre, tieneLlave } y necesita la lista final como un único texto.",
    "enunciado": "Escribe la función exploradoresConLlave(exploradores) que devuelva un string con los nombres de quienes tengan tieneLlave === true, separados por \", \" (coma y espacio).",
    "plantilla": "function exploradoresConLlave(exploradores) {\n  // Tu código aquí\n  \n}",
    "fnName": "exploradoresConLlave",
    "pruebas": [
      {
        "args": [
          [
            {
              "nombre": "Ana",
              "tieneLlave": true
            },
            {
              "nombre": "Beto",
              "tieneLlave": false
            },
            {
              "nombre": "Carla",
              "tieneLlave": true
            }
          ]
        ],
        "expected": "Ana, Carla"
      },
      {
        "args": [
          [
            {
              "nombre": "Dani",
              "tieneLlave": true
            },
            {
              "nombre": "Elena",
              "tieneLlave": false
            }
          ]
        ],
        "expected": "Dani"
      },
      {
        "args": [
          [
            {
              "nombre": "Fer",
              "tieneLlave": false
            },
            {
              "nombre": "Gema",
              "tieneLlave": false
            }
          ]
        ],
        "expected": ""
      },
      {
        "args": [
          []
        ],
        "expected": ""
      },
      {
        "args": [
          [
            {
              "nombre": "A",
              "tieneLlave": "sí"
            },
            {
              "nombre": "B",
              "tieneLlave": true
            }
          ]
        ],
        "expected": "B"
      }
    ],
    "pista": "Combina lo aprendido: filter(), map() y por último join(', ') para unir los nombres en un solo string.",
    "clave": "A"
  }
];
