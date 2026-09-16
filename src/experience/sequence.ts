export const tourHeight = 840

export const chapters = [
  { id: 'introduction', at: 0, start: 0, number: '01', label: 'The introduction', title: 'Before the light.', copy: 'A presence you feel. Before you see it.', word: '', detail: 'SCROLL TO REVEAL' },
  { id: 'reveal', at: 0.16, start: 0.075, number: '02', label: 'The reveal', title: 'Made to be seen.', copy: 'Light traces every curve. A new perspective on the Mercedes-AMG SL 63.', word: 'SL 63', detail: 'LIGHT / FORM / PRESENCE' },
  { id: 'silhouette', at: 0.29, start: 0.22, number: '03', label: 'The silhouette', title: 'Every line. Intentional.', copy: 'Follow the silhouette. Discover the details that give the SL its character.', word: 'SCULPTED', detail: 'A STUDY IN PROPORTION' },
  { id: 'wheels', at: 0.41, start: 0.35, number: '04', label: 'The wheels', title: 'A closer look.', copy: 'The wheel design, the spokes, the surfaces. Details revealed at a different scale.', word: 'DETAIL', detail: 'WHEEL / SPOKES / FINISH' },
  { id: 'interior', at: 0.53, start: 0.47, number: '05', label: 'The interior', title: 'Inside the silhouette.', copy: 'An open view of the cockpit. Explore the seats, the steering wheel and the cabin from above.', word: 'INSIDE', detail: 'AN OPEN-AIR PERSPECTIVE' },
  { id: 'rear', at: 0.65, start: 0.59, number: '06', label: 'The rear', title: 'Another side of the story.', copy: 'A moment for the rear lights and the lines that bring the bodywork together.', word: 'AMG', detail: 'LIGHTS / LINES / FORM' },
  { id: 'finale', at: 0.97, start: 0.72, number: '07', label: 'The finale', title: 'Leave an impression.', copy: 'The full circle. Back to an unmistakable presence.', word: 'SL 63', detail: 'THE FINAL PERSPECTIVE' },
] as const

export function chapterAt(progress: number) {
  return chapters.reduce((active, chapter, index) => progress >= chapter.start ? index : active, 0)
}

// Angles are deliberately unwrapped: the orbit keeps turning in the same direction.
// Detail shots change radius, elevation and target, never reverse the orbit.
export const shots = [
  { at: 0, angle: 0, radius: 6.2, y: 1.25, target: [0, 0.7, 0], light: 0.002, wide: 1 },
  { at: chapters[1].at, angle: 0.12, radius: 6.5, y: 1.65, target: [0, 0.65, 0], light: 0.85, wide: 1 },
  { at: chapters[2].at, angle: 1.5, radius: 7.5, y: 1.65, target: [0, 0.7, 0], light: 1, wide: 1 },
  { at: chapters[3].at, angle: 1.85, radius: 3.4, y: 0.8, target: [0.85, 0.42, -1.4], light: 1, wide: 0 },
  { at: chapters[4].at, angle: 2.1, radius: 4.4, y: 4.2, target: [0, 0.9, -0.4], light: 1.15, wide: 0 },
  { at: chapters[5].at, angle: 2.8, radius: 8.3, y: 2.15, target: [0, 0.65, 0], light: 0.9, wide: 1 },
  { at: 0.7, angle: 2.9, radius: 8.3, y: 2.05, target: [0, 0.65, 0], light: 0.9, wide: 1 },
  { at: chapters[6].at, angle: Math.PI * 2 + 0.51, radius: 7.56, y: 1.7, target: [0, 0.7, 0], light: 0.85, wide: 1 },
  { at: 1, angle: Math.PI * 2 + 0.51, radius: 7.56, y: 1.7, target: [0, 0.7, 0], light: 0.85, wide: 1 },
]
