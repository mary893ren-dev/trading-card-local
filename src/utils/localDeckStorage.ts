import type { CardData, CardType } from "../types/card";

import type {
  DeckRecipe,
  SavedDeckListItem,
} from "../types/deck";

import { getLocalCardImage } from "./localCardImages";

const STORAGE_KEY = "opcg-local-deck-recipes-v1";

function readDecks(): DeckRecipe[] {
  const text = localStorage.getItem(STORAGE_KEY);

  if (!text) {
    return [];
  }

  try {
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as DeckRecipe[];
  } catch {
    return [];
  }
}

function writeDecks(decks: DeckRecipe[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

export function listLocalDeckRecipes(): SavedDeckListItem[] {
  return readDecks()
    .filter((deck) => deck.mainDeck.length === 50)
    .map((deck) => ({
      id: deck.id,
      name: deck.name,
      mainCount: deck.mainDeck.length,
      hasLeader: deck.leaderCardId !== null,
      leaderCardId: deck.leaderCardId,
      updatedAt: deck.updatedAt,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getAllLocalDeckRecipes() {
  return readDecks().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getLocalDeckRecipe(id: string) {
  return readDecks().find((deck) => deck.id === id) ?? null;
}

export function saveLocalDeckRecipe(recipe: DeckRecipe) {
  const decks = readDecks();

  const index = decks.findIndex((deck) => deck.id === recipe.id);

  if (index === -1) {
    decks.push(recipe);
  } else {
    decks[index] = recipe;
  }

  writeDecks(decks);
}

export function deleteLocalDeckRecipe(id: string) {
  writeDecks(readDecks().filter((deck) => deck.id !== id));
}

function createCardData(
  cardId: string,
  type: CardType,
  isFaceUp: boolean
): CardData {
  const image = getLocalCardImage(cardId);

  if (!image) {
    throw new Error(
      `画像ZIPに ${cardId} が見つかりません。画像ZIPを読み込んでください。`
    );
  }

  return {
    id: `${cardId}-${crypto.randomUUID()}`,
    name: cardId,
    image: image.imageUrl,
    type,
    rotated: false,
    attachedDonCount: 0,
    isFaceUp,
  };
}

export function buildDeckCardsFromRecipe(recipe: DeckRecipe): CardData[] {
  if (!recipe.leaderCardId) {
    throw new Error("リーダーカードが設定されていません。");
  }

  if (recipe.mainDeck.length !== 50) {
    throw new Error("メインデッキが50枚ではありません。");
  }

  const leader = createCardData(
    recipe.leaderCardId,
    "leader",
    true
  );

  leader.lifeCount = recipe.leaderLifeCount;
  leader.donCount = recipe.donDeck.length;

  const mainDeck = recipe.mainDeck.map((cardId) =>
    createCardData(
      cardId,
      recipe.cardTypes[cardId] ?? "character",
      false
    )
  );

  const donDeck = recipe.donDeck.map((cardId) =>
    createCardData(cardId, "don", true)
  );

  return [leader, ...mainDeck, ...donDeck];
}
