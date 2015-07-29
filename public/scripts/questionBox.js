var QuestionBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url:this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, error) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  getInitialState: function() {
    return {
      data:[]
    };
  },

  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },

  createQuestion: function(question) {
    var questions = this.state.data;
    questions.push(question);
    this.setState({data: questions}, function() {
      // `setState` accepts a callback. To avoid (improbable) race condition,
      // `we'll send the ajax request right after we optimistically set the new
      // `state.
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: question,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    });

  },

  render: function(){
    return(
      <div className="questionBox">
        <QuestionForm createQuestion={this.createQuestion} />
        <QuestionList commentData={this.state.data} />
        {this.state.change} <br />
      </div>
    );
  }
});

var QuestionList = React.createClass({
  render: function() {
    var questionNodes =
      this.props.commentData.map(function(question){
        return(
          <div>
          <Question author={question.author} text={question.text} id={question.id} />
          </div>
        )
      });
    return(
      <div>
        <h1>Questions</h1>
          {questionNodes}
      </div>
    );
  }
});

var Question = React.createClass({
  render: function() {
    return(
      <div className="question">
        <h3 className="questionAuthor">
          {this.props.author}
        </h3>
        <p className="questionText">
          {this.props.text}
        </p>
      </div>
    );
  }
});

var QuestionForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var authorInput = React.findDOMNode(this.refs.authorInput).value.trim();
    var questionInput = React.findDOMNode(this.refs.questionInput).value.trim();
    if (!authorInput || !questionInput) {
      return;
    }

    this.props.createQuestion({author: authorInput, text: questionInput, answered: false});
    React.findDOMNode(this.refs.authorInput).value = ""
    React.findDOMNode(this.refs.questionInput).value = ""
  },
  render: function() {
    return(
      <div className="questionForm">
        <form onSubmit={this.handleSubmit} className="well questionForm">
          <label>Question Author</label><br />
          <input type="text" ref="authorInput" className="form-control" /><br />
          <label>Whats Your Question?</label><br />
          <input type="text" ref="questionInput" className="form-control" />
          <input type="submit" value="Ask Away!" className="btn btn-warning"></input>
        </form>
      </div>
    );
  }
});

React.render(
<QuestionBox url='questions.json' pollInterval={2000}/>,
  document.getElementById('questionBox')
)
