import * as React from 'react';
import { useDispatch } from 'react-redux';

import { slices } from 'navigader/store';
import { sendSupportEmail } from 'navigader/util';
import { Tooltip } from '../Tooltip';
import { Button } from '../Button';
import { Dialog } from '../Dialog';
import { TextField } from '../TextField';


/** ============================ Components ================================ */
export const Feedback: React.FC = () => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string>('');
  const dialogId = 'feedback-dialog-title';
  return (
    <>
      <Tooltip title="Submit Feedback">
        <Button icon="feedback" onClick={() => setDialogOpen(true)} />
      </Tooltip>

      <Dialog fullWidth open={dialogOpen} onClose={closeDialog} aria-labelledby={dialogId}>
        <Dialog.Title id={dialogId}>Help us improve NavigaDER</Dialog.Title>
        <Dialog.Content>
          <TextField
            autoFocus
            onChange={setFeedback}
            placeholder="Type your feedback here..."
            value={feedback}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button.Text onClick={closeDialog}>Cancel</Button.Text>
          <Button.Text color="primary" disabled={feedback.length === 0} onClick={submitFeedback}>
            Submit
          </Button.Text>
        </Dialog.Actions>
      </Dialog>
    </>
  );

  /** ========================== Callbacks ================================= */
  function closeDialog () {
    setDialogOpen(false);
  }

  function submitFeedback () {
    sendSupportEmail('NavigaDER feedback', feedback);
    setFeedback('');
    dispatch(slices.ui.setMessage({
      duration: null,
      msg: 'Thank you for your feedback!',
      type: 'success'
    }));
    closeDialog();
  }
};
