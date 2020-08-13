const moment = require('moment');
const { Component, Fragment } = require('inferno');

function renderContent(page) {
    if(page.type === 'text') {
        return (
            <div>
                <span>{page.content}</span>
            </div>
        )
    }else if(page.type === 'photo') {
        return (
            <div>
                <span>{page.content}</span>
            </div>
        )
    } else if(page.type === 'video') {
        return (
            <div>
                <span>{page.content}</span>
            </div>
        )
    }else{
        return (
            <div>
                <span>{page.content}</span>
            </div>
        )
    }
}

module.exports = class extends Component {
    render() {
        const { config, helper, page, index } = this.props;
        const { has_thumbnail, get_thumbnail, url_for, date, date_xml, __, _p } = helper;
        const avatar = "http://images.mokeee.com/20200219002636.jpg"

        const style = {
            avatar: {
                width:"100px",
                height:"100px"
            },
            username: {
                fontSize:18,
                fontWeight:"bold"
            }
        }

        return <Fragment>
            <div class="card">
                <article className="card-content article">
                    <div className="level-left">
                        <div>
                            <img src={avatar} style={style.avatar}/>
                        </div>
                    </div>
                        <div>
                            <div>
                                <span style={style.username}>
                                    {config.widgets.author}
                                </span>
                                <time className="level-item" dateTime={date_xml(page.date)}
                                      title={date_xml(page.date)}>{date(page.date)}</time>
                            </div>
                            <div>
                                <span></span>
                            </div>
                            <div>
                                {renderContent(page)}
                            </div>
                    </div>


                </article>

            </div>
        </Fragment>;
    }
};
