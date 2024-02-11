import getCaretCoordinates from "textarea-caret";

const defaultTriggers = ["@", "#", ":"];

export function getTriggerOffset(
  element: HTMLTextAreaElement,
  triggers = defaultTriggers
) {
  const { value, selectionStart } = element;
  for (let i = selectionStart; i >= 0; i--) {
    const char = value[i];
    if (char && triggers.includes(char)) {
      return i;
    }
  }
  return -1;
}

export function getTrigger(
  element: HTMLTextAreaElement,
  triggers = defaultTriggers
) {
  const { value, selectionStart } = element;
  const previousChar = value[selectionStart - 1];
  if (!previousChar) return null;
  const secondPreviousChar = value[selectionStart - 2];
  const isIsolated = !secondPreviousChar || /\s/.test(secondPreviousChar);
  if (!isIsolated) return null;
  if (triggers.includes(previousChar)) return previousChar;
  return null;
}

export function getSearchValue(
  element: HTMLTextAreaElement,
  triggers = defaultTriggers
) {
  const offset = getTriggerOffset(element, triggers);
  if (offset === -1) return "";
  return element.value.slice(offset + 1, element.selectionStart);
}

export function getAnchorRect(
  element: HTMLTextAreaElement,
  triggers = defaultTriggers
) {
  const offset = getTriggerOffset(element, triggers);
  const { left, top, height } = getCaretCoordinates(element, offset + 1);
  const { x, y } = element.getBoundingClientRect();
  return {
    x: left + x - element.scrollLeft,
    y: top + y - element.scrollTop,
    height
  };
}

export function replaceValue(
  offset: number,
  searchValue: string,
  displayValue: string
) {
  return (prevValue: string) => {
    const nextValue =
      prevValue.slice(0, offset) +
      displayValue +
      " " +
      prevValue.slice(offset + searchValue.length + 1);
    return nextValue;
  };
}

const emoji = [
  { value: "😄", listValue: "😄 smile" },
  { value: "😆", listValue: "😆 laughing" },
  { value: "😊", listValue: "😊 blush" },
  { value: "😃", listValue: "😃 smiley" },
  { value: "😏", listValue: "😏 smirk" },
  { value: "😍", listValue: "😍 heart_eyes" },
  { value: "😘", listValue: "😘 kissing_heart" },
  { value: "😚", listValue: "😚 kissing_closed_eyes" },
  { value: "😳", listValue: "😳 flushed" },
  { value: "😌", listValue: "😌 relieved" },
  { value: "😆", listValue: "😆 satisfied" },
  { value: "😁", listValue: "😁 grin" },
  { value: "😉", listValue: "😉 wink" },
  { value: "😀", listValue: "😀 grinning" },
  { value: "😗", listValue: "😗 kissing" },
  { value: "😙", listValue: "😙 kissing_smiling_eyes" },
  { value: "😛", listValue: "😛 stuck_out_tongue" },
  { value: "😴", listValue: "😴 sleeping" },
  { value: "😟", listValue: "😟 worried" },
  { value: "😦", listValue: "😦 frowning" },
  { value: "😧", listValue: "😧 anguished" },
  { value: "😮", listValue: "😮 open_mouth" },
  { value: "😬", listValue: "😬 grimacing" },
  { value: "😕", listValue: "😕 confused" },
  { value: "😯", listValue: "😯 hushed" },
  { value: "😑", listValue: "😑 expressionless" },
  { value: "😒", listValue: "😒 unamused" },
  { value: "😅", listValue: "😅 sweat_smile" },
  { value: "😓", listValue: "😓 sweat" },
  { value: "😥", listValue: "😥 disappointed_relieved" },
  { value: "😩", listValue: "😩 weary" },
  { value: "😔", listValue: "😔 pensive" },
  { value: "😞", listValue: "😞 disappointed" },
  { value: "😖", listValue: "😖 confounded" },
  { value: "😨", listValue: "😨 fearful" },
  { value: "😰", listValue: "😰 cold_sweat" },
  { value: "😣", listValue: "😣 persevere" },
  { value: "😢", listValue: "😢 cry" },
  { value: "😭", listValue: "😭 sob" },
  { value: "😂", listValue: "😂 joy" },
  { value: "😲", listValue: "😲 astonished" },
  { value: "😱", listValue: "😱 scream" },
  { value: "😫", listValue: "😫 tired_face" },
  { value: "😠", listValue: "😠 angry" },
  { value: "😡", listValue: "😡 rage" },
  { value: "😤", listValue: "😤 triumph" },
  { value: "😪", listValue: "😪 sleepy" },
  { value: "😋", listValue: "😋 yum" },
  { value: "😷", listValue: "😷 mask" },
  { value: "😎", listValue: "😎 sunglasses" },
  { value: "😵", listValue: "😵 dizzy_face" },
  { value: "👿", listValue: "👿 imp" },
  { value: "😈", listValue: "😈 smiling_imp" },
  { value: "😐", listValue: "😐 neutral_face" },
  { value: "😶", listValue: "😶 no_mouth" },
  { value: "😇", listValue: "😇 innocent" },
  { value: "👽", listValue: "👽 alien" },
  { value: "💛", listValue: "💛 yellow_heart" },
  { value: "💙", listValue: "💙 blue_heart" },
  { value: "💜", listValue: "💜 purple_heart" },
  { value: "❤️", listValue: "❤️ heart" },
  { value: "💚", listValue: "💚 green_heart" },
  { value: "💔", listValue: "💔 broken_heart" },
  { value: "💓", listValue: "💓 heartbeat" },
  { value: "💗", listValue: "💗 heartpulse" },
  { value: "💕", listValue: "💕 two_hearts" },
  { value: "💞", listValue: "💞 revolving_hearts" },
  { value: "💘", listValue: "💘 cupid" },
  { value: "💖", listValue: "💖 sparkling_heart" },
  { value: "✨", listValue: "✨ sparkles" },
  { value: "⭐", listValue: "⭐ star" },
  { value: "🌟", listValue: "🌟 star2" },
  { value: "💫", listValue: "💫 dizzy" },
  { value: "💥", listValue: "💥 boom" },
  { value: "💥", listValue: "💥 collision" },
  { value: "💢", listValue: "💢 anger" },
  { value: "❗", listValue: "❗ exclamation" },
  { value: "❓", listValue: "❓ question" },
  { value: "💤", listValue: "💤 zzz" },
  { value: "💨", listValue: "💨 dash" },
  { value: "💦", listValue: "💦 sweat_drops" },
  { value: "🎶", listValue: "🎶 notes" },
  { value: "🎵", listValue: "🎵 musical_note" },
  { value: "🔥", listValue: "🔥 fire" },
  { value: "💩", listValue: "💩 hankey" },
  { value: "💩", listValue: "💩 poop" },
  { value: "💩", listValue: "💩 shit" },
  { value: "👍", listValue: "👍 +1" },
  { value: "👍", listValue: "👍 thumbsup" },
  { value: "👎", listValue: "👎 +1" },
  { value: "👎", listValue: "👎 thumbsdown" },
  { value: "👌", listValue: "👌 ok_hand" },
  { value: "👊", listValue: "👊 facepunch" },
  { value: "✊", listValue: "✊ fist" },
  { value: "✌️", listValue: "✌️ v" },
  { value: "👋", listValue: "👋 wave" },
  { value: "✋", listValue: "✋ raised_hand" },
  { value: "👐", listValue: "👐 open_hands" },
  { value: "☝️", listValue: "☝️ point_up" },
  { value: "👇", listValue: "👇 point_down" },
  { value: "👈", listValue: "👈 point_left" },
  { value: "👉", listValue: "👉 point_right" },
  { value: "🙌", listValue: "🙌 raised_hands" },
  { value: "🙏", listValue: "🙏 pray" },
  { value: "👆", listValue: "👆 point_up_2" },
  { value: "👏", listValue: "👏 clap" },
  { value: "💪", listValue: "💪 muscle" },
  { value: "🤘", listValue: "🤘 metal" },
  { value: "🖕", listValue: "🖕 fu" },
  { value: "🚶", listValue: "🚶 walking" },
  { value: "🏃", listValue: "🏃 runner" },
  { value: "🏃", listValue: "🏃 running" },
  { value: "👫", listValue: "👫 couple" },
  { value: "👪", listValue: "👪 family" },
  { value: "👬", listValue: "👬 two_men_holding_hands" },
  { value: "👭", listValue: "👭 two_women_holding_hands" },
  { value: "💃", listValue: "💃 dancer" },
  { value: "👯", listValue: "👯 dancers" },
  { value: "🙆‍♀️", listValue: "🙆‍♀️ ok_woman" },
  { value: "🙅", listValue: "🙅 no_good" },
  { value: "💁", listValue: "💁 information_desk_person" },
  { value: "🙋", listValue: "🙋 raising_hand" },
  { value: "👰‍♀️", listValue: "👰‍♀️ bride_with_veil" },
  { value: "🙇", listValue: "🙇 bow" },
  { value: "💏", listValue: "💏 couplekiss" },
  { value: "💑", listValue: "💑 couple_with_heart" },
  { value: "💆", listValue: "💆 massage" },
  { value: "💇", listValue: "💇 haircut" },
  { value: "💅", listValue: "💅 nail_care" },
  { value: "👦", listValue: "👦 boy" },
  { value: "👧", listValue: "👧 girl" },
  { value: "👩", listValue: "👩 woman" },
  { value: "👨", listValue: "👨 man" },
  { value: "👶", listValue: "👶 baby" },
  { value: "👵", listValue: "👵 older_woman" },
  { value: "👴", listValue: "👴 older_man" },
  { value: "👲", listValue: "👲 man_with_gua_pi_mao" },
  { value: "👳‍♂️", listValue: "👳‍♂️ man_with_turban" },
  { value: "👷", listValue: "👷 construction_worker" },
  { value: "👮", listValue: "👮 cop" },
  { value: "👼", listValue: "👼 angel" },
  { value: "👸", listValue: "👸 princess" },
  { value: "😺", listValue: "😺 smiley_cat" },
  { value: "😸", listValue: "😸 smile_cat" },
  { value: "😻", listValue: "😻 heart_eyes_cat" },
  { value: "😽", listValue: "😽 kissing_cat" },
  { value: "😼", listValue: "😼 smirk_cat" },
  { value: "🙀", listValue: "🙀 scream_cat" },
  { value: "😿", listValue: "😿 crying_cat_face" },
  { value: "😹", listValue: "😹 joy_cat" },
  { value: "😾", listValue: "😾 pouting_cat" },
  { value: "👹", listValue: "👹 japanese_ogre" },
  { value: "👺", listValue: "👺 japanese_goblin" },
  { value: "🙈", listValue: "🙈 see_no_evil" },
  { value: "🙉", listValue: "🙉 hear_no_evil" },
  { value: "🙊", listValue: "🙊 speak_no_evil" },
  { value: "💂‍♂️", listValue: "💂‍♂️ guardsman" },
  { value: "💀", listValue: "💀 skull" },
  { value: "🐾", listValue: "🐾 feet" },
  { value: "👄", listValue: "👄 lips" },
  { value: "💋", listValue: "💋 kiss" },
  { value: "💧", listValue: "💧 droplet" },
  { value: "👂", listValue: "👂 ear" },
  { value: "👀", listValue: "👀 eyes" },
  { value: "👃", listValue: "👃 nose" },
  { value: "👅", listValue: "👅 tongue" },
  { value: "🔔", listValue: "🔔 bell" },
  { value: "🔕", listValue: "🔕 no_bell" },
  { value: "🎋", listValue: "🎋 tanabata_tree" },
  { value: "🎉", listValue: "🎉 tada" },
  { value: "🎊", listValue: "🎊 confetti_ball" },
  { value: "🔮", listValue: "🔮 crystal_ball" },
  { value: "♻️", listValue: "♻️ recycle" },
  { value: "🔚", listValue: "🔚 end" },
  { value: "🔛", listValue: "🔛 on" },
  { value: "🔜", listValue: "🔜 soon" }
];
