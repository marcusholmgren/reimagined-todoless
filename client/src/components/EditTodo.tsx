import * as React from "react";
import { Form, Button } from "semantic-ui-react";
import Auth from "../auth/Auth";
import { getUploadUrl, uploadFile } from "../api/todos-api";
import {WarningMessage} from './MessagePanel'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      todoId: string;
    };
  };
  auth: Auth;
}

interface EditTodoState {
  file: any;
  uploadState: UploadState;
  warning: { header: string, message: string } | null;
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    warning: null
  };

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    this.setState({
      file: files[0],
    });
  };

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    try {
      if (!this.state.file) {
        //alert("File should be selected");
              this.setState({
        warning: {
          header: "File should be selected",
          message: "File should be selected"
        }
      })
        return;
      }

      this.setUploadState(UploadState.FetchingPresignedUrl);
      const uploadUrl = await getUploadUrl(
        this.props.auth.getIdToken(),
        this.props.match.params.todoId
      );

      this.setUploadState(UploadState.UploadingFile);
      await uploadFile(uploadUrl, this.state.file);

      //alert("File was uploaded!");
            this.setState({
        warning: {
          header: "File was uploaded!",
          message: "File was uploaded!"
        }
      })
    } catch (e) {
      //alert("Could not upload a file: " + e.message);
            this.setState({
        warning: {
          header: 'File upload failed',
          message: `Could not upload a file: ${e.message}`
        }
      })
    } finally {
      this.setUploadState(UploadState.NoUpload);
    }
  };

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState,
    });
  }

  render() {
    const warningElement = this.state.warning ?
      (<WarningMessage header={this.state.warning.header} message={this.state.warning.message} />) : null

    return (
      <div>
        <h1>Upload new image</h1>
        {warningElement}
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    );
  }

  renderButton() {
    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && (
          <p>Uploading image metadata</p>
        )}
        {this.state.uploadState === UploadState.UploadingFile && (
          <p>Uploading file</p>
        )}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    );
  }
}
