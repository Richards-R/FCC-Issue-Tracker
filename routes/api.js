"use strict";
let expect = require("chai").expect;
const mongodb = require("mongodb");
const mongoose = require("mongoose");

module.exports = function (app) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let issueSchema = new mongoose.Schema({
    project: String,
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    open: { type: Boolean, required: true },
    created_on: { type: Date, required: true },
    updated_on: { type: Date, required: true },
  });

  let Issue = mongoose.model("Issue", issueSchema);

  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      let project = req.params.project;
      const query = req.query;
      if (Object.keys(query).length > 0) {
        let querydata = Object.assign(req.params, query);
        let issues = await Issue.find(querydata);
        return res.send(issues);
      } else {
        let issues = await Issue.find({ project });
        return res.send(issues);
      }
    })

    .post(function (req, res) {
      let project = req.params.project;
      if (
        !req.body.issue_title ||
        !req.body.issue_text ||
        !req.body.created_by
      ) {
        return res.json({ error: "required field(s) missing" });
      }
      let newIssue = new Issue({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        open: true,
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        project: project,
      });
      newIssue.save();
      return res.json(newIssue);
    })

    .put(async function (req, res) {
      let project = req.params.project;
      let updateObject = {};
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] != "") {
          updateObject[key] = req.body[key];
        }
      });
      if (Object.keys(updateObject).length === 1) {
        return res.json({
          error: "no update field(s) sent",
          _id: req.body._id,
        });
      }
      if (Object.keys(updateObject).length === 0) {
        return res.json({ error: "missing _id" });
      }

      updateObject["updated_on"] = new Date().toUTCString();

      let updatedIssue = await Issue.findByIdAndUpdate(
        req.body._id,
        updateObject,
        { new: true },
      );

      if (updatedIssue) {
        return res.json({ result: "successfully updated", _id: req.body._id });
      } else {
        return res.json({ error: "could not update", _id: req.body._id });
      }
    })

    .delete(async function (req, res) {
      if (!req.body._id) {
        return res.json({ error: "missing _id" });
      }
      let deletingIssue = await Issue.deleteOne({ _id: req.body._id });
      if (deletingIssue.deletedCount === 0) {
        return res.json({ error: "could not delete", _id: req.body._id });
      } else if (deletingIssue.deletedCount === 1) {
        return res.json({ result: "successfully deleted", _id: req.body._id });
      }
    });
};
