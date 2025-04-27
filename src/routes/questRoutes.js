// Fichier des routes pour la gestion des quêtes (admin et utilisateur)
import express from 'express';
import verifyToken from '../middleware/authMiddleware.js'; // Vérifie le token JWT
import checkRole from '../middleware/roleMiddleware.js'; // Vérifie le rôle
import Quest from '../models/Quest.js'; // Modèle de quête
import UserQuest from '../models/UserQuest.js'; // Modèle de progression de quête
import User from '../models/User.js'; // Modèle utilisateur

const router = express.Router(); // Création du routeur

// Créer une nouvelle quête (admin uniquement)
router.post('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { key, name, target, reward, resetFrequency } = req.body;
    const quest = new Quest({ key, name, target, reward, resetFrequency });
    await quest.save();
    // Initialiser la progression pour tous les utilisateurs
    const allUsers = await User.find({});
    const initData = allUsers.map(u => ({ user: u._id, quest: quest._id }));
    await UserQuest.insertMany(initData, { ordered: false });
    return res.status(201).json({ success: true, data: quest });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Lister les quêtes (admin : toutes, user : ses quêtes dynamiques)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      // Lister toutes les quêtes, actives et désactivées
      const quests = await Quest.find();
      return res.json({ success: true, data: quests });
    }
    // Cas user normal -> liste dynamiques avec progression
    const user = await User.findById(req.user.userId);
    const today = new Date().toDateString();
    const dailyRewardClaimed = user.dateDerRecomp && new Date(user.dateDerRecomp).toDateString() === today;
    const defs = await Quest.find({ active: true });
    const quests = await Promise.all(defs.map(async def => {
      let uq = await UserQuest.findOne({ user: user._id, quest: def._id });
      if (!uq) {
        uq = await UserQuest.create({ user: user._id, quest: def._id });
      }
      return {
        _id: def._id,
        key: def.key,
        name: def.name,
        target: def.target,
        reward: def.reward,
        resetFrequency: def.resetFrequency,
        current: uq.progress,
        completed: uq.completed,
        claimed: uq.claimed
      };
    }));
    return res.json({ dailyRewardClaimed, orbesReward: 10, quests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Modifier une quête (admin uniquement)
router.put('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const quest = await Quest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quest) {
      return res.status(404).json({ success: false, message: 'Quête non trouvée' });
    }
    return res.json({ success: true, data: quest });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Supprimer une quête (admin uniquement)
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const quest = await Quest.findByIdAndDelete(req.params.id);
    if (!quest) {
      return res.status(404).json({ success: false, message: 'Quête non trouvée' });
    }
    return res.json({ success: true, message: 'Quête supprimée définitivement' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Désactiver une quête (admin uniquement)
router.patch('/:id/deactivate', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) {
      return res.status(404).json({ success: false, message: 'Quête non trouvée' });
    }
    quest.active = false;
    await quest.save();
    return res.json({ success: true, message: 'Quête désactivée', data: quest });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Activer une quête (admin uniquement)
router.patch('/:id/activate', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) {
      return res.status(404).json({ success: false, message: 'Quête non trouvée' });
    }
    quest.active = true;
    await quest.save();
    return res.json({ success: true, message: 'Quête activée', data: quest });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router; 