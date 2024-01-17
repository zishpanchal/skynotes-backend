const express = require("express");
const router = express.Router();
var fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//Route1: get all notes using :GET "api/auth/getuser". login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

//Route2: add notes using :POST "api/auth/addnote". login required
router.post(
  "/addnote",
  fetchuser,
  body("title", "Title must be 3 characters long").isLength({ min: 3 }),
  body("description", "Description must be atleast 5 characters").isLength({
    min: 5,
  }),
  async (req, res) => {
    const { title, description, tag } = req.body;
    try {
      //if the validation error array is empty run the code
      const error = validationResult(req);
      if (error.isEmpty()) {
        const note = new Note({
          title,
          description,
          tag,
          user: req.user.id,
        });
        const savedNote = await note.save();
        res.json(savedNote);
      } else {
        res.send({ errors: result.array() });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

//Route3: update note using :PUT "api/auth/updatenote". login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
    //create a new note
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //find the note to update it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note not found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("You are not allowed to update it");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

//Route4: delete note using :PUT "api/auth/deletenote". login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    //find the note to delete it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note not found");
    }
    //Allow delete only for the owner of the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("You are not allowed to delete it");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", Note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});
module.exports = router;
