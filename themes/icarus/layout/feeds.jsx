const { Component } = require('inferno');
const Feed = require('./feed');


module.exports = class extends Component {

    componentDidMount() {
        console.log(this.props);
    }


    render() {
        const { config, page, helper } = this.props;

        return (
            <div>
                <Feed config={config} page={page} helper={helper} index={false} />
            </div>
            )

    }
};
