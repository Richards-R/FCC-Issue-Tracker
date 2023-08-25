const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const mongoose = require("mongoose");

chai.use(chaiHttp);

let id1 = "";
let id2 = "";

suite("Functional Tests", function () {
  after(function () {
    chai.request(server).get("/api");
  });

  suite("POST /api/issues/{project} => object with issue data", function () {
    test("#1.  Create an issue with every field", function (done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Create an issue with every field",
          issue_text: "Text",
          created_by: "Creator",
          assigned_to: "Assignee",
          status_text: "Current status",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(
            res.body.issue_title,
            "Create an issue with every field",
          );
          assert.equal(res.body.issue_text, "Text");
          assert.equal(res.body.created_by, "Creator");
          assert.equal(res.body.assigned_to, "Assignee");
          assert.equal(res.body.status_text, "Current status");
          assert.equal(res.body.project, "test");
          id1 = res.body._id;
          console.log("id 1 has been set as " + id1);
          done();
        });
    });

    test("#2.  Create an issue with only required fields", function (done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Create an issue with only required fields",
          issue_text: "Text",
          created_by: "Creator",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(
            res.body.issue_title,
            "Create an issue with only required fields",
          );
          assert.equal(res.body.issue_text, "Text");
          assert.equal(res.body.created_by, "Creator");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          assert.equal(res.body.project, "test");
          id2 = res.body._id;
          console.log("id 2 has been set as " + id2);
          done();
        });
    });

    test("#3.  Create an issue with missing required fields", function (done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "",
          issue_text: "",
        })
        .end(function (err, res) {
          console.log(res.body.error);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });

  suite(
    "GET /api/issues/{project} => Array of objects with issue data",
    function () {
      test("#4.  View (all) issues on a project", function (done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], "issue_title");
            assert.property(res.body[0], "issue_text");
            assert.property(res.body[0], "created_on");
            assert.property(res.body[0], "updated_on");
            assert.property(res.body[0], "created_by");
            assert.property(res.body[0], "assigned_to");
            assert.property(res.body[0], "open");
            assert.property(res.body[0], "status_text");
            assert.property(res.body[0], "_id");
            done();
          });
      });

      test("#5.  View issues on a project with one filter", function (done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({ created_by: "Creator" })
          .end(function (err, res) {
            res.body.forEach((issueResult) => {
              assert.equal(issueResult.created_by, "Creator");
            });
            done();
          });
      });

      test("#6.  View issues on a project with multiple filters", function (done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({
            open: true,
            created_by: "Creator",
          })
          .end(function (err, res) {
            res.body.forEach((issueResult) => {
              assert.equal(issueResult.open, true);
              assert.equal(issueResult.created_by, "Creator");
            });
            done();
          });
      });
    },
  );

  suite("PUT /api/issues/{project} => text", function () {
    test("#7.  Update one field on an issue", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: id1,
          issue_text: "newly updated text",
        })
        .end(function (err, res) {
          assert.equal(res.body.result, "successfully updated");
          done();
        });
    });

    test("#8.  Update multiple fields on an issue", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: id2,
          issue_title: "newly updated title",
          issue_text: "newly updated text",
        })
        .end(function (err, res) {
          assert.equal(res.body.result, "successfully updated");
          done();
        });
    });

    test("#9.  Update an issue with missing id", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          issue_title: "newly updated title",
          issue_text: "newly updated text",
        })
        .end(function (err, res) {
          assert.equal(res.body.error, "could not update");
          done();
        });
    });

    test("#10.  Update an issue with no fields to update", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: id1,
        })
        .end(function (err, res) {
          assert.equal(res.body.error, "no update field(s) sent");
          done();
        });
    });

    test("#11.  Update an issue with an invalid id", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: 64e759481941202957123456,
          issue_title: "newly updated title",
          issue_text: "newly updated text",
        })
        .end(function (err, res) {
          assert.equal(res.body.error, "could not update");
          done();
        });
    });

    suite("DELETE /api/issues/{project} => text", function () {
      test("#12.  Delete an issue", function (done) {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({
            _id: id1,
          })
          .end(function (err, res) {
            assert.equal(res.body.result, "successfully deleted");
            done();
          });
      });

      test("#13.  Delete an issue with an invalid id", function (done) {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({
            _id: 64e759481941202957123456,
          })
          .end(function (err, res) {
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });

      test("#14.  Delete an issue with missing id", function (done) {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({
            _id: "",
            issue_title: "newly updated title",
            issue_text: "newly updated text",
          })
          .end(function (err, res) {
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });
    });
  });
});
