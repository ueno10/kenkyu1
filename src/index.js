import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import * as d3 from 'd3'
import { set } from 'd3';
class Chart extends React.Component {
    constructor(props) {
      super(props);
      this.state={
        count : '0',
        filterKeyword : '',
        policy : 'ALL',
        reportYear : '',
        show : 'default',
        money : '補正予算', 
        divisions : 'ALL',
        hideMinistries : new Set(),
        transform : {x:0,y:0,k:1}
      };
      this.zoom = d3.zoom()
      .on('zoom',()=>{
        this.setState({transform:d3.event.transform})
      })
    }
    componentDidMount(){
      d3.select(this.refs.ff14).call(this.zoom).on("dblclick.zoom", null)
    }
  
    render() {
        const data = this.props.data
        console.log(data)
        const ministries = new Set()
        
        for(const node of data){
          ministries.add(node['府省庁'])
        }
        const ministryIndex = new Map(
          Array.from(ministries).map((ministry,i)=>[ministry,i])
        )
        if(this.state.show === 'default'){
          for (const node of data){
            const index = ministryIndex.get(node['府省庁'])
            node.fillColor = d3.hsl(360*(index/ministries.size),0.5,0.5,0.6).toString()
          }
        }
        else if(this.state.show === 'ministry'){
          const clusters = new Set()
          for (const node of data){
            clusters.add(node.cluster_in_ministry)
          }
          const clusterIndex = new Map(
            Array.from(clusters).map((cluster,i)=>[cluster,i])
          )
          for(const node of data){
            const index = clusterIndex.get(node.cluster_in_ministry)
            node.fillColor = d3.hsl(360*(index/clusters.size),0.5,0.5,0.6).toString()
          }
        }
        else if(this.state.show === 'business'){
          const clusters = new Set()
          for (const node of data){
            clusters.add(node[this.state.policy])
          }
          const clusterIndex = new Map(
            Array.from(clusters).map((cluster,i)=>[cluster,i])
          )
          for(const node of data){
            const index = clusterIndex.get(node[this.state.policy])
            node.fillColor = d3.hsl(360*(index/clusters.size),0.5,0.5,0.6).toString()
          }
        }
        const policies = new Set()
        for(const node of data){
          policies.add(node['主要政策・施策'])
        }
        const projectIds = new Set()
        for(const node of data){
          projectIds.add(node['プロジェクトID'])
        }
        const projectIdIndex = new Map(
          Array.from(projectIds).map((projectId,i)=>[projectId,i])
        )
        
        const width = 1600
        const height = 1000
        const textMargin = 100
        const labelMargin = 1100
        const xScale = d3.scaleLinear()
        .domain(d3.extent(data, (item) => +(item.objective_x)))
        .range([-450,450])
        .nice()
        const yScale = d3.scaleLinear()
        .domain(d3.extent(data, (item) => +(item.objective_y)))
        .range([450, -450])
        .nice() 

        if(this.state.money === '補正予算') {
          console.log(this.state.money);
        }
        //const moneyScale = d3.scaleLog()
        //.domain(d3.extent(data, (item) => (+(item[this.state.money])+10)))
        //.base(10)
        //.range([0, 15])
        //.nice()

        const showData = new Array()
        data.filter((v,cnt)=>{
          return(
            !this.state.hideMinistries.has(v['府省庁'])
          )
        }).filter((v,i)=>{
          if(v['事業名'].includes(this.state.filterKeyword)===true || v['事業の目的'].includes(this.state.filterKeyword)===true){
            return true
          }
          else{
            return false
          }
        }).filter((v,i)=>{
          if(this.state.policy === "ALL"){
            return true
          }
          else{
            if(v['主要政策・施策'].includes(this.state.policy)===true){
              return true
            }
            else{
              return false
            }
          }
        }).filter((v,i)=>{
          if(v['公開年度'] === this.state.reportYear){
            return true
          }
          else{
            return false
          }
        }).filter((v,i) => {
          if(this.state.divisions === "ALL") {
            return true
          } else {
            return v["会計区分"].includes(this.state.divisions)
          }
        }).filter((v,i) => {
          if(+v[this.state.money] >= 1) {
            return true
          } else {
            return false
          }
        }).map((v,i)=>{
          showData.push(v)
        })

        const moneyScale = d3.scaleLog()
        .domain(d3.extent(showData, (item) => (+(item[this.state.money])+10)))
        .base(10)
        .range([0, 15])
        //.nice()
      　

        console.log(showData);
  
        return (
          <div>
            <div className='refine'>
              <div>
                <b>年度 : </b>
                <select name='select' id='select' defalutValue='' onChange ={(event)=>{this.setState({reportYear:event.target.value})}}>
                  <option value=''></option>
                  <option value='2015'>27年度</option>
                  <option value='2016'>28年度</option>
                  <option value='2017'>29年度</option>
                  <option value='2018'>30年度</option>
                  <option value='2019'>31年度</option>
                  </select>
              </div>
            </div>
            <div className='refine'>
              <div>
                <b>表示方法 : </b>
                <select name="select" id="select" defalutValue="default" onChange ={(event)=>{this.setState({show:event.target.value})}}>
                  <option value="default">default</option>
                  <option value="ministry">ministry</option>
                  <option value="business">business</option>
                  <option value="none">none</option>
                </select>
              </div>
            </div>
            <div className='refine'>
              <div>
                <b>主要政策・施策 : </b>
                <select name='select' id='select' defalutValue='ALL' onChange ={(event)=>{this.setState({policy:event.target.value})}}>
                  <option value='ALL'>ALL</option>
                  <option value='高齢社会対策'>高齢社会対策</option>
                  <option value='男女共同参画'>男女共同参画</option>
                  <option value='少子化社会対策'>少子化社会対策</option>
                  <option value='子ども・若者育成支援'>子ども・若者育成支援</option>
                  <option value='国土強靱化施策'>国土強靱化施策</option>
                  <option value='障害者施策'>障害者施策</option>
                  <option value='地方創生'>地方創生</option>
                  <option value='科学技術・イノベーション'>科学技術・イノベーション</option>
                  <option value='ＩＴ戦略'>ＩＴ戦略</option>
                  <option value='一億総活躍推進'>一億総活躍推進</option>
                  <option value='海洋政策'>海洋政策</option>
                  <option value='観光立国'>観光立国</option>
                  <option value='宇宙開発利用'>宇宙開発利用</option>
                  <option value='地球温暖化対策'>地球温暖化対策</option>
                  <option value='ＯＤＡ'>ＯＤＡ</option>
                  <option value='自殺対策'>自殺対策</option>
                  <option value='医療分野の研究開発関連'>医療分野の研究開発関連</option>
                  <option value='沖縄振興'>沖縄振興</option>
                  <option value='知的財産'>知的財産</option>
                  <option value='2020年東京オリパラ'>2020年東京オリパラ</option>
                  <option value='犯罪被害者等施策'>犯罪被害者等施策</option>
                  <option value='クールジャパン'>クールジャパン</option>
                  <option value='食育推進'>食育推進</option>
                  <option value='その他'>その他</option>
                </select>
              </div>
            </div>
            <div className='refine'>
              <div>
                <b>予算（仮） : </b>
                <select name="select" id="select" defalutValue="補正予算" onChange ={(event)=>{this.setState({money:event.target.value})}}>
                  <option value="補正予算">補正予算</option>
                  <option value="当初予算">当初予算</option>
                  <option value="前年度から繰越し">前年度から繰越し</option>
                  <option value="翌年度へ繰越し">翌年度へ繰越し</option>
                  <option value="執行額">執行額</option>
                </select>
              </div>
            </div>
            <div className='refine'>
              <div>
                <b>会計区分（仮） : </b>
                <select name="select" id="select" defalutValue="ALL" onChange ={(event)=>{this.setState({divisions:event.target.value})}}>
                  <option value="ALL">ALL</option>
                  <option value="一般会計">一般会計</option>
                  <option value="東日本大震災復興特別会計">東日本大震災復興特別会計</option>
                </select>
              </div>
            </div>
            
            <div className='refine'>
              <form onSubmit={(event)=>{
                  event.preventDefault()
                  this.setState({filterKeyword:this.refs.search.value})
                }}
                >
                <input ref='search'>
                </input>
                <button>絞り込み
                </button>
              </form>
            </div>
            <div>
              <div>
              <b>事業数：{(showData.length).toString()}</b>
              </div>
            </div>
            <svg style = {{cursor:'move'}}ref = 'ff14' viewBox= {`0 0 ${width} ${height}`}>
              <rect x="1" y="1" width={width-2} height={height-2}
                fill="none" stroke="blue" stroke-width="2" />
              <g transform = {`translate(1400,0)`}>
                <text x={0} y={76}>(千万円)</text>
                {
                  moneyScale.ticks(7).map((m,i)=>{ 
                    return <g>
                      <circle 
                        cx={0} cy={`${i*30+textMargin}`}
                        r={moneyScale(m)}
                        fill='black'
                        />
                      <text x={20}y={`${i*30+textMargin+6}`}>{m/10}</text>
                    </g>
                  })
                }
              </g>
              <g transform = {`translate(1100,0)`}>
                <g style = {{cursor:'pointer'}}onClick={()=>{  
                    if(this.state.hideMinistries.size === 0){
                      this.setState({hideMinistries:new Set(ministries)})
                    }else{
                      this.setState({hideMinistries:new Set()})
                    }}}>
                  <text x={0} y={`${-1*30+textMargin+6}`}>(府省庁)</text>
                </g>
                {
                  Array.from(ministries).map((ministry,i)=>{
                    return <g key = {i} style = {{cursor:'pointer'}}onClick={()=>{
                      const newSet = new Set(this.state.hideMinistries)
                        if(newSet.has(ministry)){
                          newSet.delete(ministry)
                        }else{
                          newSet.add(ministry)
                        }
                        this.setState({hideMinistries:newSet})
                      }}
                      >
                      <circle 
                        cx={0} cy={`${i*30+textMargin}`}
                        r='10'
                        fill={d3.hsl(360*(i/20),0.5,0.5,0.6)}
                        />
                      <text x={10}y={`${i*30+textMargin+6}`}>{ministry}</text>
                    </g>
                  })
                }
              </g>
              <g transform = {`translate(1400,600)`}>
                <g style = {{cursor:'pointer'}}onClick={()=>
                  d3.select(this.refs.ff14).call(this.zoom.transform, d3.zoomIdentity.scale(1))
                  }>
                  <text x={0} y={76}>リセット</text>
                </g>
              </g>
              <g transform = {`translate(${this.state.transform.x},${this.state.transform.y})scale(${this.state.transform.k})`}>
                <g>
                  {
                    showData.map((v,i)=>{
                      return <g key={i} transform = {`translate(500,${height/2})`}>
                        <title>
                          {v['府省庁']+', '}
                          {v['主要政策・施策']+', '}
                          {v['事業名']+', '}
                          {+(v[this.state.money])/10}
                        </title>
                        <circle style = {{cursor:'pointer'}}
                          cx={xScale(+(v.objective_x))} cy={yScale(+(v.objective_y))} 
                          r={moneyScale(+(v[this.state.money])+10)}
                          fill={v.fillColor}
                          />
                      </g>
                    })
                  }
                </g>
              </g>
            </svg>
          </div>
        );
      
    }
  }
  
  class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        data: null
      };
    }
    
    componentDidMount() {
      const url =
        "./data/tsne_+_clusters_list.json"; //あ
      window
        .fetch(url)
        .then(response => response.json())
        .then(data => {
          this.setState({ data });
        });
    }
  
    render() {
      const { data } = this.state;
      return (
        <>
          <section className="section">
            <div className="container">
              <div className="content has-text-centered">
                <div style={{ margin: "2em" }}>
                  {data&&
                    <Chart data={data} />
                    }
                </div>
              </div>
            </div>
          </section>
          {/* <footer className="footer">
          </footer> */}
        </>
      );
    }
  }
  
  class Root extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        error: null
      };
    }
  
    static getDerivedStateFromError(error) {
      return { error };
    }
  
    componentDidCatch(error, info) {
      console.error(error.toString());
    }
  
    render() {
      const { error } = this.state;
      if (error != null) {
        return (
          <div className="hero is-danger is-fullheight">
            <div class="hero-body">
              <div class="container">
                <h1 class="title">{error.toString()}</h1>
              </div>
            </div>
          </div>
        );
      }
      return <App />;
    }
  }
  

render(<Root />, document.querySelector('#content'))