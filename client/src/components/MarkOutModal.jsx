import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function MarkOutModal({ show, handleClose, handleSubmit }) {
  const [topic, setTopic] = useState('');
  const [staffName, setStaffName] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(topic, staffName);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Mark Out</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Topic</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Staff Name</Form.Label>
            <Form.Select
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              required
            >
              <option value="">Select Staff</option>
              <option value="Aneesh">Aneesh</option>
              <option value="Bhavan Sarathy">Bhavan Sarathy</option>
              <option value="Santhiya">Santhiya</option>
              <option value="Nanthakumar">Nanthakumar</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="success">
            Submit Attendance
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default MarkOutModal;
