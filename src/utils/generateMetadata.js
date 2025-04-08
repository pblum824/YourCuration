export default function generateMetadata(filename) {
  const lower = filename.toLowerCase();

  const dimensions = {
    colorPalette: [],
    visualTone: [],
    mood: [],
    subject: [],
    message: []
  };

  // COLOR
  if (lower.includes('sunset') || lower.includes('warm')) {
    dimensions.colorPalette.push('warm tones');
  }
  if (lower.includes('mono') || lower.includes('bw')) {
    dimensions.colorPalette.push('monochrome');
  }

  // TONE
  if (lower.includes('grainy')) {
    dimensions.visualTone.push('grainy');
  }
  if (lower.includes('soft')) {
    dimensions.visualTone.push('soft-focus');
  }
  if (lower.includes('sharp')) {
    dimensions.visualTone.push('sharp');
  }

  // MOOD
  if (lower.includes('love') || lower.includes('romantic')) {
    dimensions.mood.push('romantic');
  }
  if (lower.includes('fog') || lower.includes('quiet')) {
    dimensions.mood.push('calm');
  }

  // SUBJECT
  if (lower.includes('dog') || lower.includes('bird') || lower.includes('cat')) {
    dimensions.subject.push('animal');
  }
  if (lower.includes('building') || lower.includes('arch') || lower.includes('window')) {
    dimensions.subject.push('architecture');
  }

  // MESSAGE
  if (lower.includes('storm') || lower.includes('wreck')) {
    dimensions.message.push('chaos');
  }
  if (lower.includes('bridge') || lower.includes('trail')) {
    dimensions.message.push('journey');
  }

  // Fallback
  if (
    !Object.values(dimensions).some(arr => arr.length > 0)
  ) {
    dimensions.mood.push('neutral');
    dimensions.visualTone.push('soft-focus');
  }

  return {
    tags: Object.values(dimensions).flat(),
    dimensions
  };
}