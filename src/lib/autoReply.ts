const REPLIES = [
  'Cute pup! 🐶',
  'Where do you usually walk?',
  "We're nearby too — would love a playdate!",
  'When are you free this week?',
  'My pup is super social, would be a great match!',
  'How old is your pet?',
  "Is yours vaccinated? Mine just got their shots done.",
  'We love Cubbon Park on weekends. You?',
  'Send a pic of your pup!',
  "Let's meet up sometime!",
];

export function pickAutoReply(prevText: string | null | undefined): string {
  if (!prevText) return REPLIES[0];
  const lower = prevText.toLowerCase();
  if (lower.includes('meet') || lower.includes('park')) return "Let's meet up sometime!";
  if (lower.includes('?')) return REPLIES[Math.floor(Math.random() * REPLIES.length)];
  const idx = Math.floor(Math.random() * REPLIES.length);
  return REPLIES[idx];
}
